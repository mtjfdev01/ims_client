import React, { useCallback } from 'react';
import SearchableSelect from './SearchableSelect';
import { customersApi, itemsApi, sellersApi, unwrapList } from '../services/api';
import { itemNameLabel, itemOptionLabel } from '../pages/items/itemCondition';

const personLabel = (row) => {
  const extras = [row.phone, row.cnic].filter(Boolean);
  return extras.length ? `${row.name} (${extras.join(' · ')})` : row.name;
};

const toOptions = (rows, labelFn) => unwrapList(rows).map((row) => ({
  value: row.id,
  label: labelFn(row),
  raw: row,
}));

export const ItemSearchSelect = ({ shopOnly = false, ...props }) => {
  const fetchOptions = useCallback(async (search) => {
    const filters = { search };
    if (shopOnly) {
      filters.filterType = 'shop';
    }
    return unwrapList(await itemsApi.getAll(1, 20, filters)).map((row) => ({
      value: row.id,
      label: itemOptionLabel(row),
      selectedLabel: itemNameLabel(row),
      raw: row,
    }));
  }, [shopOnly]);

  const fetchSelected = useCallback(async (id) => {
    const item = await itemsApi.getOne(id);
    if (!item || item.error) {
      return null;
    }
    return { value: item.id, label: itemNameLabel(item), raw: item };
  }, []);

  return (
    <SearchableSelect
      placeholder="Search item"
      fetchOptions={fetchOptions}
      fetchSelected={fetchSelected}
      {...props}
    />
  );
};

export const CustomerSearchSelect = (props) => {
  const fetchOptions = useCallback(async (search) => (
    toOptions(await customersApi.getAll(1, 20, { search }), personLabel)
  ), []);

  const fetchSelected = useCallback(async (id) => {
    const customer = await customersApi.getOne(id);
    if (!customer || customer.error) {
      return null;
    }
    return { value: customer.id, label: personLabel(customer), raw: customer };
  }, []);

  return (
    <SearchableSelect
      placeholder="Search customer"
      emptyOption={{ value: '', label: 'Walk-in / no customer' }}
      fetchOptions={fetchOptions}
      fetchSelected={fetchSelected}
      {...props}
    />
  );
};

export const SellerSearchSelect = (props) => {
  const fetchOptions = useCallback(async (search) => (
    toOptions(await sellersApi.getAll(1, 20, { search }), personLabel)
  ), []);

  const fetchSelected = useCallback(async (id) => {
    const seller = await sellersApi.getOne(id);
    if (!seller || seller.error) {
      return null;
    }
    return { value: seller.id, label: personLabel(seller), raw: seller };
  }, []);

  return (
    <SearchableSelect
      placeholder="Search seller"
      emptyOption={{ value: '', label: 'No seller' }}
      fetchOptions={fetchOptions}
      fetchSelected={fetchSelected}
      {...props}
    />
  );
};
