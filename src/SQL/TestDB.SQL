CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- to use uuid generator
-- create database test_meme_db if not exists;
-- use test_meme_db;


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
    "accountUid" varchar(255) references account  on update cascade on delete set null
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
    "id" serial primary key,
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



-- public account
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('zLMEK11qxWhsXUpzIMqgoCpci8E2', 'dirk.metacore@gmail.com', 'dirk.metacore', 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('IjjE2ni5MVPcGdZ0Mw1w0kMV9fE2', 'stroan20@gmail.com', 'TheRao','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('NgsV6IFDYwVHWxyt2OORgVCDQNJ3', 'raoframe@gmail.com', 'arron','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('tA95AUhYCIY4qerK1Ez4kLuDyyj2', 'stroan93@gmail.com', 'arronstr','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('Ujti1yOL0MhtOh5yJ6clkGE2wW62', 'rao@metacorehealth.com', 'raos','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('mIi5ID1RmLNX6aFGohu9Uo78sKh2', 'mariatua2@gmail.com', 'marytesting','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('aZzV1UA48bWc4T68OO3elYVFyUq1', 'mvortizr@gmail.com', 'mary','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('Rpc4ahEL3HZcRUkPhgdNF0CQ4H33', 'marytest1@gmail.com', 'marytest1','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('EUA0N8p3RlYL7LBuZgOskmkeBsH2', 'marytest2@gmail.com', 'marytest2','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('OYwvaE1UO2fH6I6J6MWsGxZeoMH2', 'marytesting123@gmail.com', 'marytesting123','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('fSQ9CAMcQARz3A739SXz2sJnsSw2', 'mary7@gmail.com', 'mary7','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('HHcTqTMHpLX0gA6IESQKCmWqKoC3', 'straodev@gmail.com', 'reckoners','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('6sjxrjS6hdO1v0v8qU5kZEuUoog2', 'patrick.buchanan.dugan@gmail.com', 'duganist','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('kWcObECxVucz6I3IjvfQocj4mi22', 'rivara.eugenia@gmail.com', 'euge','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('KUs75zHZVDWrRbPusMJIMz1Aaqi2', 'shawn@gmail.com', 'shawn','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('y0NGSz1XkAexvTlTNSU6rzKhtbC3', '13-11020@usb.ve', 'marya','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('bw9nmX9YD2WtZKQZOQbnwZkJzvy1', 'mariatua2@hotmail.com', 'mary10','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('lzX10JlxAkYVkFvD3GL2mxZdKDj1', 'mary11@hotmail.com', 'mary11','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('lFncaqVA3Xh0CfgGWg8TQnFq9A43', 'mary15@hotmail.com', 'mary15','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('EqeANywnlBZyuq45PaOTV2iX4JI2', 'mary17@gotmail.com', 'mary17','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('Ezr1MsMAkAXOgXazaaKjUEXtHaW2', 'mary16@hotmail.com', 'mary16','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');
INSERT INTO public.account (uid, email, username, "avatarUrl") VALUES ('VhE52xdC1agMfjUtlXF40y4Rq9c2', 'mary5555@gmail.com', 'mary5555','https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png');


-- public address
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (1, '0x5Bf823cA5b7E36EcBdb9807502592e6645D70B69', 'IjjE2ni5MVPcGdZ0Mw1w0kMV9fE2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (2, '0xd36DeaEE2EF17e22e47417d126FAc10843518715', 'IjjE2ni5MVPcGdZ0Mw1w0kMV9fE2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (3, '0x5639748458f9b69652c4479050259FeE2b5Af815', 'mIi5ID1RmLNX6aFGohu9Uo78sKh2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (4, '0x910bf8b7b7583a91a73bb3971d70654ed9a2f700', 'zLMEK11qxWhsXUpzIMqgoCpci8E2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (6, '5e6JaTNpeFCwNGhXPhztHXFewmsKCRHeXJaaMQa4aRnk', 'zLMEK11qxWhsXUpzIMqgoCpci8E2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (7, '0x555853680F333E238E0E05e229AE1e5a25Cb1A81', '6sjxrjS6hdO1v0v8qU5kZEuUoog2');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (8, '0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455', 'y0NGSz1XkAexvTlTNSU6rzKhtbC3');
-- INSERT INTO public.address (id, addressDir, "accountUid") VALUES (11, '0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455', 'lFncaqVA3Xh0CfgGWg8TQnFq9A43');

-- public profile info
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'zLMEK11qxWhsXUpzIMqgoCpci8E2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'IjjE2ni5MVPcGdZ0Mw1w0kMV9fE2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'NgsV6IFDYwVHWxyt2OORgVCDQNJ3');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'tA95AUhYCIY4qerK1Ez4kLuDyyj2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'Ujti1yOL0MhtOh5yJ6clkGE2wW62');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'mIi5ID1RmLNX6aFGohu9Uo78sKh2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'aZzV1UA48bWc4T68OO3elYVFyUq1');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'Rpc4ahEL3HZcRUkPhgdNF0CQ4H33');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'EUA0N8p3RlYL7LBuZgOskmkeBsH2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'OYwvaE1UO2fH6I6J6MWsGxZeoMH2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'fSQ9CAMcQARz3A739SXz2sJnsSw2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'HHcTqTMHpLX0gA6IESQKCmWqKoC3');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, '6sjxrjS6hdO1v0v8qU5kZEuUoog2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'kWcObECxVucz6I3IjvfQocj4mi22');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'KUs75zHZVDWrRbPusMJIMz1Aaqi2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'y0NGSz1XkAexvTlTNSU6rzKhtbC3');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'bw9nmX9YD2WtZKQZOQbnwZkJzvy1');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'lzX10JlxAkYVkFvD3GL2mxZdKDj1');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'lFncaqVA3Xh0CfgGWg8TQnFq9A43');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'EqeANywnlBZyuq45PaOTV2iX4JI2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'Ezr1MsMAkAXOgXazaaKjUEXtHaW2');
INSERT INTO public."profileInfo" (id, "bannerUrl", "profileDescription", website, "accountUid") VALUES (DEFAULT, 'https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg', null, null, 'VhE52xdC1agMfjUtlXF40y4Rq9c2');

INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455', 'VhE52xdC1agMfjUtlXF40y4Rq9c2');
INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622', 'Ezr1MsMAkAXOgXazaaKjUEXtHaW2');
-- -- pinned NFTs
-- INSERT INTO public.pinned (id, "accountUid", "addressId", "contractAddress", "tokenId") VALUES (DEFAULT, 'VhE52xdC1agMfjUtlXF40y4Rq9c2', 7, '0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9', '72');
-- INSERT INTO public.pinned (id, "accountUid", "addressId", "contractAddress", "tokenId") VALUES (DEFAULT, 'VhE52xdC1agMfjUtlXF40y4Rq9c2', 7, '0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9', '71');
-- INSERT INTO public.pinned (id, "accountUid", "addressId", "contractAddress", "tokenId") VALUES (DEFAULT, 'VhE52xdC1agMfjUtlXF40y4Rq9c2', 7, '0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9', '70');
-- INSERT INTO public.pinned (id, "accountUid", "addressId", "contractAddress", "tokenId") VALUES (DEFAULT, 'VhE52xdC1agMfjUtlXF40y4Rq9c2', 7, '0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9', '69');
--
-- -- addresses
-- INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455', 'VhE52xdC1agMfjUtlXF40y4Rq9c2');
-- INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622', 'VhE52xdC1agMfjUtlXF40y4Rq9c2');
-- INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0x860068c363a8B8E2d33Ac470EF3C5BcD8B58597C', 'VhE52xdC1agMfjUtlXF40y4Rq9c2');
-- INSERT INTO public.address (id, "addressDir", "accountUid") VALUES (DEFAULT, '0xe691aA7a471F616Bd7c210f1C4c4042f2a06feb0', 'VhE52xdC1agMfjUtlXF40y4Rq9c2');

commit;
--
-- SELECT "id", "addressDir" AS addDir, "accountUid" FROM "address"  WHERE "address"."addressDir" = '0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455';