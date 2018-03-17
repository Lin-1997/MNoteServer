drop database if exists MNote;
create database MNote;
use MNote;

create table if not exists user(
account char(11) primary key,
password varchar(20) not null,
name varchar(20) not null);

create table if not exists note(
account char(11) not null references user(account),
createDate date not null,/*YYYY-MM-DD*/
createTime time not null,/*HH:MM:SS*/
updateDate date not null,/*YYYY-MM-DD*/
updateTime time not null,/*HH:MM:SS*/
content longtext not null,
id int not null);