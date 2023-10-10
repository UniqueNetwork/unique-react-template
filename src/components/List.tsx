import React, { PropsWithChildren } from 'react';
type ListProps = PropsWithChildren & {
};

function List({ children }: ListProps) {
  return <div className='list-container'>
    {children}
  </div>;
};

function ListItem({ children }: PropsWithChildren) {
  return <div className='list-item'>
    {children}
  </div>
}

List.Item = ListItem;

export { List };
