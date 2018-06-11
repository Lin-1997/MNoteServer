delimiter //

create procedure serverGetUser(account char(11))
begin
select * from user where user.account=account;
end //

create procedure serverGetNote(account char(11))
begin
select * from note where note.account=account;
end //

create procedure serverDeleteUser(account char(11))
begin
delete from user where user.account=account;
end //

create procedure serverDeleteNote(account char(11))
begin
delete from note where note.account=account;
end //

delimiter ;