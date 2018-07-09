drop database if exists MNote;
create database MNote;
use MNote;

create table if not exists user(
account char(11) primary key,
password varchar(20) not null,
name varchar(20) not null);

create table if not exists note(
account char(11),
id int not null,
updateDate date not null,/*YYYY-MM-DD*/
updateTime time not null,/*HH:MM:SS*/
content longtext not null,
foreign key(account) references user(account) on delete cascade);