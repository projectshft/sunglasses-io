  CREATE DATABASE products;

  USE products;


  CREATE TABLE Brand(
    id int auto_increment primary key unique not null,
    name text,
    created_at date,
    updated_at date
  );

  CREATE TABLE Product(
    id int auto_increment primary key unique not null,
    brand_id int not null,
    name text,
    description text,
    price int,
    imageURL text,
    created_at date,
    updated_at date
  );

  CREATE TABLE User(
    id int auto_increment primary key unique not null,
    first_name text,
    last_name text,
    email text,
    gender text,
    phone text,
    DOB date,
    created_at date,
    updated_at date
  );

  CREATE TABLE User_Login(
    id int auto_increment primary key unique not null,
    user_id int not null,
    username text,
    password text,
    salt text,
    md5 text,
    sha1 text,
    sha256 text,
    created_at date,
    updated_at date
  );

  CREATE TABLE User_Products(
    id int auto_increment primary key unique not null,
    user_id int not null,
    product_id int not null,
    created_at date,
    updated_at date
  );

  ALTER TABLE Product
  ADD FOREIGN KEY(brand_id)
  REFERENCES Brand(id);

ALTER TABLE User_Login
  ADD FOREIGN KEY(user_id)
  REFERENCES User(id);

ALTER TABLE User_Products
  ADD FOREIGN KEY(user_id)
  REFERENCES User(id),
  ADD FOREIGN KEY(product_id)
  REFERENCES Product(id);

  insert into Brand values (1, 'Oakley', '2020-03-10', '2020-03-10');
  insert into Brand values (2, 'Ray Ban', '2020-03-10', '2020-03-10');
  insert into Brand values (3, 'Levis', '2020-03-10', '2020-03-10');
  insert into Brand values (4, 'DKNY', '2020-03-10', '2020-03-10');
  insert into Brand values (5, 'Burberry', '2020-03-10', '2020-03-10');

  insert into Product values (1, 1, 'Sunglasses', "The best glasses in the world", 150, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
  insert into Product values (2, 1, 'Black Sunglasses', "The best glasses in the world", 100, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
  insert into Product values (3, 1, 'Brown Sunglasses', "The best glasses in the world", 50, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (4, 2, 'Better glasses', "The best glasses in the world", 1500, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
  insert into Product values (5, 2, 'Glasses', "The best glasses in the world", 150, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (6, 3, 'glas', "The best glasses in the world", 10, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (7, 3, 'QDogs Glasses', "The best glasses in the world", 1500, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (8, 4, 'Coke Cans', "The best glasses in the world", 110, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
  insert into Product values (9, 4, 'Sugar', "The best glasses in the world", 125, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (10, 5, 'Peanut Butter', "The best glasses in the world", 103, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');
insert into Product values (11, 5, 'Habanero', "The best glasses in the world", 150, "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", '2020-03-10', '2020-03-10');

insert into User values (1, 'susanna', 'richards', 'susanna.richards@example.com', 'female', "031-941-6700","1954-10-09 10:47:17", '2020-03-10', '2020-03-10');
insert into User values (2, 'salvador', 'jordan', 'salvador.jordan@example.com', 'male', "(944)-261-2164","1955-07-28 22:32:14", '2020-03-10', '2020-03-10');
insert into User values (3, 'natalia', 'ramos', 'natalia.ramos@example.com', 'female', "903-556-986","1947-03-05 15:23:07", '2020-03-10', '2020-03-10');

insert into User_Login values (3, 3, 'greenlion235', 'waters', 'w10ZFgoO', '19f6fb510c58be44b2df1816d88b739d', "18e545aee27156ee6be35596631353a14ee03007","2b23b25939ece8ba943fe9abcb3074105867c267d122081a2bc6322f935ac809", '2020-03-10', '2020-03-10');
insert into User_Login values (2, 2, 'lazywolf342', 'tucker', 'oSngghny', '30079fb24f447efc355585fcd4d97494', "dbeb2d0155dad0de0ab9bbe21c062e260a61d741","4f9416fa89bfd251e07da3ca0aed4d077a011d6ef7d6ed75e1d439c96d75d2b2", '2020-03-10', '2020-03-10');
insert into User_Login values (1, 1, 'yellowleopard753', 'jonjon', 'eNuMvema', 'a8be2a69c8c91684588f4e1a29442dd7', "f9a60bbf8b550c10712e470d713784c3ba78a68e","4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0", '2020-03-10', '2020-03-10');

