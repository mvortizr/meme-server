CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- to use uuid generator

create table if not exists account
(
    uid  varchar(255) not null primary key,
    email    varchar(255) not null unique,
    username varchar(255) not null unique,
    "avatarUrl" varchar(255) not null
);


create table if not exists address
(
    id   serial primary key,
    "addressDir"   varchar(255) not null unique,
    "accountUid" varchar(255) references account  on update cascade on delete cascade
);


create table if not exists pinned
(
    id serial primary key,
    "accountUid" varchar(255) references account on update cascade on delete cascade,
    "addressId" int references address on update cascade on delete cascade,
    "contractAddress" varchar(255) not null,
    "tokenId" varchar(255) not null
);


create table if not exists "profileInfo"
(
    id uuid DEFAULT uuid_generate_v4 () primary key ,
    "bannerUrl" varchar(255),
    "profileDescription" varchar(600),
    website varchar(255),
    "accountUid" varchar(255) references account on update cascade on delete cascade
);

create table if not exists trade
(
    id serial primary key,
   "tradeId" int not null ,
   "itemId"  int not null,
   price float not null,
   royalty float not null,
   status varchar(255) not null,
   "tokenId"  varchar(255) not null,
   "nftContract" varchar(255) not null,
   "createdDate" timestamp with time zone not null default CURRENT_DATE,
   "soldDate" timestamp with time zone,
   "cancelledDate" timestamp with time zone,
   "addressCreated"  int not null references address on update cascade on delete restrict,
   "addressSold" int references address on update cascade on delete restrict

);

commit;