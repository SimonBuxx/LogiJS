const crypto = require('crypto');
const knex = require('knex')(require('./knexfile'));

module.exports = {
    createUser({ username, password }) {
        console.log(`Add user ${username}`);
        const { salt, hash } = saltHashPassword({ password });
        return knex('user').where({ username })
            .then(([user]) => {
                if (user) {
                    console.log('Failure');
                    return { success: false };
                } else {
                    return knex('user').insert({
                        salt,
                        encrypted_password: hash,
                        username
                    }).then(function () {
                        console.log('Success');
                        return { success: true };
                    });
                }
            });
    },
    authenticate({ username, password }) {
        console.log(`Authenticating user ${username}`);

        return knex('user').where({ username })
            .then(([user]) => {
                if (!user) {
                    return { success: false };
                }
                const { hash } = saltHashPassword({
                    password,
                    salt: user.salt
                });
                if (hash === user.encrypted_password) {
                    return knex('user').where({ username }).update({ updated_at: knex.fn.now() })
                        .then(function () { return { success: hash === user.encrypted_password }; });
                }
                return { success: false };
            });
    },
    save({ owner, filename }) {
        console.log(`Add file ${filename} by ${owner}`);
        return knex('files').insert({
            owner,
            filename
        });
    }
};

function saltHashPassword({
    password,
    salt = randomString()
}) {
    const hash = crypto
        .createHmac('sha512', salt)
        .update(password);
    return {
        salt,
        hash: hash.digest('hex')
    };
}

function randomString() {
    return crypto.randomBytes(4).toString('hex');
}
