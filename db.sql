create table users (
    id serial primary key,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password_hash varchar(255) not null,
    created_at timestamp default current_timestamp
);

create table classes (
    id serial primary key,
    name varchar(100) not null,
    description text,
    created_at timestamp default current_timestamp
);

create table user_classes (
    user_id int references users(id) on delete cascade,
    class_id int references classes(id) on delete cascade,
    role varchar(20) not null,
    primary key (user_id, class_id)
);



insert into classes (id, name, description) values
    (1, 'Ducklings', 'Beginner swimming class for young learners'),
    (2, 'Tadpoles', 'Gentle water confidence and basic swim skills'),
    (3, 'Frogs', 'Improving strokes, kicking, and breathing technique'),
    (4, 'Penguins', 'Intermediate swimming with stronger endurance'),
    (5, 'Seals', 'Developing coordination and confidence in deeper water'),
    (6, 'Sharks', 'Advanced swimming for confident, skilled swimmers');


