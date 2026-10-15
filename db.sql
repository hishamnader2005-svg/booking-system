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
