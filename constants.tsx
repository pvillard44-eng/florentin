
import { ParentConfig, Parent } from './types';

export const PARENTS: Record<Exclude<Parent, 'NONE'>, ParentConfig> = {
  CARINE: {
    name: 'Carine',
    color: 'rose',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-700',
  },
  ROBERT: {
    name: 'Robert',
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
  },
};

export const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
