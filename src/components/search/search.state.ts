import { Jinx, Spells } from '@/store/core';

@Jinx('searchInput', '')
class SearchInput extends Spells<string> {}

export const searchInput = new SearchInput();
