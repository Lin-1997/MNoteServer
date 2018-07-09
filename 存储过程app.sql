delimiter //

create procedure findAccount(account char(11))
begin
select count(*) as num from user where user.account=account;
end //

create procedure signUp(account char(11),password varchar(20))
begin
insert user value(account,password,account);
end //

create procedure signIn(account char(11),password varchar(20))
begin
select name from user where user.account=account and user.password=password;
end //

create procedure changeName(account char(11),name varchar(30))
begin
update user set user.name=name where user.account=account;
end //

create procedure changePassword(account char(11),
passwordOld varchar(20),passwordNew varchar(20))
begin
update user set user.password=passwordNew where user.account=account
and user.password=passwordOld;
select count(*) as num from user where user.account=account
and user.password=passwordNew;
end //

create procedure forgetPassword(account char(11),password varchar(20))
begin
update user set user.password=password where user.account=account;
end //

create procedure getNote(account char(11))
begin
select * from note where note.account=account order by updateDate,updateTime desc;
end //

delimiter ;