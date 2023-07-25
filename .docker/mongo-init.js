db.createUser({
  user: 'admin',
  pwd: 'example',
  roles: [
    {
      role: 'dbOwner',
      db: 'db_audit',
    },
  ],
});

