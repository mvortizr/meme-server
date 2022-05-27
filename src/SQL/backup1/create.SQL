create table if not exists account
(
    uid  varchar(255) not null primary key,
    email    varchar(255) not null unique,
    username varchar(255) not null unique
);

alter table account owner to data_entry;

create table if not exists address
(
    id   serial primary key,
    address   varchar(255) not null unique,
    "accountUid" varchar(255) references account  on update cascade on delete set null
);

alter table address owner to data_entry;

create table if not exists pinned
(
    id varchar(255) not null primary key,
    "accountUid" varchar(255) references account on update cascade on delete set null
);

alter table pinned owner to data_entry;


