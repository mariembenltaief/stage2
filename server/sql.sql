create table categories (
   id_categorie serial primary key,
   name         varchar not null,
   description  varchar(255),
   id           serial
      references users ( id )
);
create table products (
   id_produit   serial primary key,
   name         varchar not null,
   price        varchar(250),
   photo        varchar(255),
   id_categorie serial
      references categories ( id_categorie ),
   id_user      varchar(255)
)