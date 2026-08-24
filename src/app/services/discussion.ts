import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Discussion {
  id: number | string;
  client_id: number;
  agriculteur_id: number;
  livreur_id?: number;
  produit_id?: number;
  commande_id?: number;
  statut: string;
  dernier_message_at: string;
  created_at: string;
  client?: any;
  agriculteur?: any;
  livreur?: any;
  produit?: any;
  commande?: any;
  dernier_message?: any;
  non_lus_count?: number;
  messages?: any[];
}

export interface Message {
  id: number | string;
  discussion_id: number | string;
  expediteur_id: number;
  contenu: string;
  type_message?: 'texte' | 'image' | 'fichier' | 'systeme';
  fichier_url?: string;
  est_lu: boolean;
  created_at: string;
  expediteur?: any;
}

@Injectable({ providedIn: 'root' })
export class DiscussionService {
  private apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'agroconnect_discussions_local';

  constructor(private http: HttpClient) {
    this.initDefaultLocalDiscussions();
  }

  getDiscussions(): Observable<Discussion[]> {
    const local = this.getLocalDiscussions();
    return this.http.get<Discussion[]>(`${this.apiUrl}/discussions`).pipe(
      map(apiDiscussions => {
        const mergedMap = new Map<string, Discussion>();
        if (Array.isArray(local)) {
          for (const d of local) {
            if (d && d.id) {
              if (d.messages) d.messages = this.deduplicateMessages(d.messages);
              mergedMap.set(String(d.id), d);
            }
          }
        }
        if (Array.isArray(apiDiscussions)) {
          for (const d of apiDiscussions) {
            if (d && d.id) {
              const existingLocal = mergedMap.get(String(d.id));
              if (existingLocal && existingLocal.messages && existingLocal.messages.length > 0) {
                if (!d.messages || d.messages.length === 0) {
                  d.messages = existingLocal.messages;
                } else {
                  d.messages = this.deduplicateMessages([...d.messages, ...existingLocal.messages]);
                }
              } else if (d.messages) {
                d.messages = this.deduplicateMessages(d.messages);
              }
              mergedMap.set(String(d.id), d);
            }
          }
        }
        const mergedList = Array.from(mergedMap.values());
        this.saveLocalDiscussions(mergedList);
        return mergedList;
      }),
      catchError(() => {
        return of(this.getLocalDiscussions());
      })
    );
  }

  getDiscussion(id: number | string): Observable<Discussion> {
    const localList = this.getLocalDiscussions();
    const found = localList.find(d => String(d.id) === String(id));

    return this.http.get<Discussion>(`${this.apiUrl}/discussions/${id}`).pipe(
      tap(disc => {
        if (disc) {
          if (disc.messages && disc.messages.length > 0) {
            disc.messages = this.deduplicateMessages(disc.messages);
          } else if (found && found.messages && found.messages.length > 0) {
            disc.messages = found.messages;
          }
          this.updateLocalDiscussion(disc);
        }
      }),
      catchError(() => {
        if (found) return of(found);

        const nowStr = new Date().toISOString();
        const fallbackDisc: Discussion = {
          id: id,
          client_id: 1,
          agriculteur_id: 1,
          statut: 'active',
          dernier_message_at: nowStr,
          created_at: nowStr,
          client: this.getCurrentUserObj(),
          agriculteur: { user: { name: 'Producteur local', telephone: '', role: 'agriculteur' } },
          produit: { nom: 'Produit agricole', prix_unitaire: 0, unite_mesure: 'kg' },
          messages: []
        };
        return of(fallbackDisc);
      })
    );
  }

  private getCurrentUserObj() {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name) {
          return { id: parsed.id || 1, name: parsed.name, role: parsed.role || 'client' };
        }
      } catch (e) {}
    }
    return { id: 1, name: 'Cheikh Fall', role: 'client' };
  }

  demarrerDiscussion(data: {
    agriculteur_id: number;
    livreur_id?: number;
    produit_id?: number;
    commande_id?: number;
    nom_agriculteur?: string;
    telephone_agriculteur?: string;
    nom_produit?: string;
    image_produit?: string;
    prix_produit?: number;
    unite_produit?: string;
    message?: string;
    type_message?: string;
    fichier_url?: string;
  }): Observable<Discussion> {
    const currentUserObj = this.getCurrentUserObj();
    const localList = this.getLocalDiscussions();
    const nowStr = new Date().toISOString();

    let existing = localList.find(d => 
      String(d.agriculteur_id) === String(data.agriculteur_id) &&
      ((data.produit_id && String(d.produit_id) === String(data.produit_id)) || 
       (data.commande_id && String(d.commande_id) === String(data.commande_id)) || 
       (!data.produit_id && !data.commande_id))
    );

    const isNew = !existing;

    if (!existing) {
      existing = {
        id: Date.now(),
        client_id: currentUserObj.id,
        agriculteur_id: data.agriculteur_id,
        livreur_id: data.livreur_id,
        produit_id: data.produit_id,
        commande_id: data.commande_id,
        statut: 'active',
        dernier_message_at: nowStr,
        created_at: nowStr,
        client: currentUserObj,
        agriculteur: {
          id: data.agriculteur_id,
          user: { name: data.nom_agriculteur || 'Producteur local', telephone: data.telephone_agriculteur || '772345678', role: 'agriculteur' }
        },
        produit: data.produit_id ? {
          id: data.produit_id,
          nom: data.nom_produit || 'Produit Agricole',
          image: data.image_produit,
          prix_unitaire: data.prix_produit || 1000,
          unite_mesure: data.unite_produit || 'kg'
        } : undefined,
        messages: []
      };
      localList.unshift(existing);
    } else {
      if (data.nom_agriculteur && existing.agriculteur?.user) {
        existing.agriculteur.user.name = data.nom_agriculteur;
      }
      if (data.nom_produit) {
        existing.produit = {
          id: data.produit_id || existing.produit_id,
          nom: data.nom_produit,
          image: data.image_produit || existing.produit?.image,
          prix_unitaire: data.prix_produit || existing.produit?.prix_unitaire || 1000,
          unite_mesure: data.unite_produit || existing.produit?.unite_mesure || 'kg'
        };
      }
    }

    // N'ajouter le message d'introduction que si c'est une TOUTE NOUVELLE discussion (ou si elle n'a encore aucun message)
    if ((isNew || !existing.messages || existing.messages.length === 0) && (data.message || data.fichier_url)) {
      const msgObj: Message = {
        id: Date.now() + 1,
        discussion_id: existing.id,
        expediteur_id: currentUserObj.id,
        contenu: data.message || '',
        type_message: (data.type_message as any) || 'texte',
        fichier_url: data.fichier_url,
        est_lu: true,
        created_at: nowStr,
        expediteur: currentUserObj
      };
      existing.messages = existing.messages || [];
      if (!existing.messages.some(m => m.contenu === msgObj.contenu)) {
        existing.messages.push(msgObj);
        existing.dernier_message = msgObj;
        existing.dernier_message_at = nowStr;
      }
    }

    // Sauvegarder immédiatement la discussion locale créée pour la rendre réactive et disponible 0ms
    this.saveLocalDiscussions(localList);

    const payload = {
      agriculteur_id: data.agriculteur_id,
      livreur_id: data.livreur_id,
      produit_id: data.produit_id,
      commande_id: data.commande_id,
      message: data.message,
      type_message: data.type_message || 'texte',
      fichier_url: data.fichier_url
    };

    return this.http.post<Discussion>(`${this.apiUrl}/discussions`, payload).pipe(
      tap(apiDisc => {
        if (apiDisc && apiDisc.id) {
          const currentLocal = this.getLocalDiscussions();
          const tmpIdx = currentLocal.findIndex(d => String(d.id) === String(existing!.id));
          if (tmpIdx !== -1) {
            currentLocal[tmpIdx] = apiDisc;
          } else {
            currentLocal.unshift(apiDisc);
          }
          this.saveLocalDiscussions(currentLocal);
        }
      }),
      catchError(() => {
        return of(existing!);
      })
    );
  }

  envoyerMessage(discussionId: number | string, data: { contenu: string; type_message?: string; fichier_url?: string } | string): Observable<Message> {
    const payload = typeof data === 'string' ? { contenu: data } : data;
    const currentUserObj = this.getCurrentUserObj();
    const nowStr = new Date().toISOString();

    const localMsg: Message = {
      id: Date.now(),
      discussion_id: discussionId,
      expediteur_id: currentUserObj.id,
      contenu: payload.contenu || '',
      type_message: (payload.type_message as any) || 'texte',
      fichier_url: payload.fichier_url,
      est_lu: true,
      created_at: nowStr,
      expediteur: currentUserObj
    };

    const localList = this.getLocalDiscussions();
    const disc = localList.find(d => String(d.id) === String(discussionId));
    if (disc) {
      disc.messages = disc.messages || [];
      if (!disc.messages.some(m => String(m.id) === String(localMsg.id))) {
        disc.messages.push(localMsg);
      }
      disc.dernier_message = localMsg;
      disc.dernier_message_at = nowStr;
      this.saveLocalDiscussions(localList);
    }

    const isLocalId = typeof discussionId === 'string' ? discussionId.length > 8 : discussionId > 2147483647;
    if (isLocalId) {
      return of(localMsg);
    }

    return this.http.post<Message>(`${this.apiUrl}/discussions/${discussionId}/messages`, payload).pipe(
      map(newMsg => {
        if (newMsg && newMsg.id) {
          const currentList = this.getLocalDiscussions();
          const currentDisc = currentList.find(d => String(d.id) === String(discussionId));
          if (currentDisc && currentDisc.messages) {
            const idx = currentDisc.messages.findIndex(m => String(m.id) === String(localMsg.id));
            if (idx !== -1) currentDisc.messages[idx] = newMsg;
            else currentDisc.messages.push(newMsg);
            this.saveLocalDiscussions(currentList);
          }
          return newMsg;
        }
        return localMsg;
      }),
      catchError(() => {
        return of(localMsg);
      })
    );
  }

  getNombreMessagesNonLus(): Observable<{ non_lus: number }> {
    const local = this.getLocalDiscussions();
    const currentUserObj = this.getCurrentUserObj();
    let localNonLus = 0;
    if (Array.isArray(local)) {
      for (const d of local) {
        if (d.messages && Array.isArray(d.messages)) {
          for (const m of d.messages) {
            if (m && String(m.expediteur_id) !== String(currentUserObj.id) && !m.est_lu) {
              localNonLus++;
            }
          }
        } else if (d.non_lus_count) {
          localNonLus += d.non_lus_count;
        }
      }
    }

    return this.http.get<{ non_lus: number }>(`${this.apiUrl}/discussions/non-lus/count`).pipe(
      map(res => ({ non_lus: Math.max(res?.non_lus || 0, localNonLus) })),
      catchError(() => of({ non_lus: localNonLus }))
    );
  }

  getLocalDiscussions(): Discussion[] {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null;
    let list: Discussion[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }

    // 1. Nettoyer toute ancienne donnée de démo (Ousmane Sow / Acheteur Sénégal)
    let cleaned = list.filter(d => 
      !d.agriculteur?.user?.name?.includes('Ousmane Sow') && 
      !d.client?.name?.includes('Acheteur Sénégal') &&
      String(d.id) !== '1'
    );

    if (cleaned.length !== list.length) {
      this.saveLocalDiscussions(cleaned);
    }

    // 2. Filtrer les discussions selon l'identité de l'utilisateur actuellement connecté
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        if (u) {
          const role = u.role || 'client';
          const userId = u.id;
          const userName = u.name;

          cleaned = cleaned.filter(d => {
            if (role === 'admin') return true;

            if (role === 'agriculteur') {
              // Si connecté en tant que Producteur/Agriculteur :
              // L'agriculteur ne voit QUE les messages qui LUI sont spécifiquement adressés !
              const agriUserId = d.agriculteur?.user_id || d.agriculteur?.user?.id;
              const agriTableId = d.agriculteur?.id || d.agriculteur_id;
              const userAgriTableId = u.agriculteur?.id || u.agriculteur_id;
              const agriName = d.agriculteur?.user?.name || d.agriculteur?.nom;

              if (agriUserId && userId && String(agriUserId) === String(userId)) return true;
              if (userAgriTableId && agriTableId && String(userAgriTableId) === String(agriTableId)) return true;
              if (agriName && userName && agriName.toLowerCase().trim() === userName.toLowerCase().trim()) return true;
              if (agriName && userName && (agriName.toLowerCase().includes(userName.toLowerCase()) || userName.toLowerCase().includes(agriName.toLowerCase()))) return true;
              return false;
            } else if (role === 'livreur') {
              const livreurId = d.livreur_id || d.livreur?.id;
              return livreurId && userId && String(livreurId) === String(userId);
            } else {
              // Si connecté en tant que Client / Acheteur :
              const clientId = d.client_id || d.client?.id;
              const clientName = d.client?.name;
              
              if (clientId && userId && String(clientId) === String(userId)) return true;
              if (clientName && userName && clientName.toLowerCase().includes(userName.toLowerCase())) return true;
              return true;
            }
          });
        }
      } catch (e) {}
    }

    // Dédoublonner les messages automatiques répétés dans chaque discussion
    for (const d of cleaned) {
      if (d.messages && Array.isArray(d.messages)) {
        d.messages = this.deduplicateMessages(d.messages);
        if (d.messages.length > 0) {
          d.dernier_message = d.messages[d.messages.length - 1];
        }
      }
    }

    return cleaned;
  }

  public deduplicateMessages(messages: Message[]): Message[] {
    if (!messages || !Array.isArray(messages)) return [];
    const uniqueMsgs: Message[] = [];
    const seenKeys = new Set<string>();
    for (const msg of messages) {
      if (!msg) continue;
      const text = (msg.contenu || '').trim();
      const isAutoGreeting = text.includes('je suis intéressé par votre produit') ||
                             text.includes('question concernant ma commande') ||
                             text.includes('livreur en charge de la livraison');
      const dedupKey = isAutoGreeting ? `${msg.expediteur_id}_${text}` : (msg.id ? `id_${msg.id}` : `msg_${msg.expediteur_id}_${text}_${msg.created_at}`);
      if (seenKeys.has(dedupKey)) {
        continue;
      }
      seenKeys.add(dedupKey);
      uniqueMsgs.push(msg);
    }
    return uniqueMsgs;
  }

  private updateLocalDiscussion(discussion: Discussion) {
    if (!discussion || !discussion.id) return;
    const localList = this.getLocalDiscussions();
    const idx = localList.findIndex(d => String(d.id) === String(discussion.id));
    if (idx !== -1) {
      const existingDisc = localList[idx];
      if ((!discussion.messages || discussion.messages.length === 0) && existingDisc.messages && existingDisc.messages.length > 0) {
        discussion.messages = existingDisc.messages;
      }
      localList[idx] = discussion;
    } else {
      localList.unshift(discussion);
    }
    this.saveLocalDiscussions(localList);
  }

  private saveLocalDiscussions(list: Discussion[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }
  }

  private initDefaultLocalDiscussions(): Discussion[] {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      if (!existing) {
        this.saveLocalDiscussions([]);
      }
    }
    return [];
  }
}
