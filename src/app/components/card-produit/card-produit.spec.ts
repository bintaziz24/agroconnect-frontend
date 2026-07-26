import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProduit } from './card-produit';

describe('CardProduit', () => {
  let component: CardProduit;
  let fixture: ComponentFixture<CardProduit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardProduit],
    }).compileComponents();

    fixture = TestBed.createComponent(CardProduit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
