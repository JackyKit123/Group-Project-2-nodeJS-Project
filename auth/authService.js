module.exports = class {
    constructor(knex, bcrypt, nodemailer, randomstring, redisClient) {
        this.knex = knex
        this.bcrypt = bcrypt
        this.nodemailer = nodemailer
        this.randomstring = randomstring
        this.redisClient = redisClient
    }

    async signUp(username, displayname, email, password, confirm_password) {
        try {
            const checkUsername = await this.knex('login_info').where('username', username);
            const checkEmail = await this.knex('login_info').where('email', email);
            const usernameRegistered = checkUsername[0];
            const emailRegistered = checkEmail[0];
            if (username.length < 5 || username.length > 15 || /\W/.test(username))
                return { error: '<p>Invalid Username</p>' }
            if (!/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email))
                return { error: '<p>Invalid Email Address</p>' }
            if (password.length < 8 || password.legnth > 16 || ! /[a-z]|[A-z]/.test(password) || ! /[0-9]/.test(password))
                return { error: '<p>Bad Password</p>' }
            if (displayname.legnth < 5 || displayname.length > 15)
                return { error: '<p>Bad Displayed Name</p>' }
            if (password !== confirm_password)
                return { error: '<p>Password not matched</p>' }
            if (typeof emailRegistered !== 'undefined' && emailRegistered.verifying)
                return { error: `<p>Email is already registered but not verified, <a href='/resend/${email}'>Click Here<a> if you wish to recieve the verification email again.</p>` }
            if (emailRegistered)
                return { error: '<p>Email has already been taken</p>' }
            if (usernameRegistered)
                return { error: '<p>Username has already been taken</p>' }
            const hash = await this.bcrypt.hashPassword(password);
            const verifyString = this.randomstring.generate();
            const newUser = {
                username: username,
                display_name: displayname,
                email: email,
                password: hash,
                verifying: verifyString
            };
            this.nodemailer.sendVerificationMail(email, verifyString);
            await this.knex('login_info').insert(newUser);
            return {
                success: `You have successfully registered
        Please check your email box for verifcation email
        Please note that the email may be in junk mail box`};
        } catch (err) {
            throw err;
        }
    }

    async forgetPassword(email) {
        try {
            const resetKey = this.randomstring.generate();
            let exist = await this.knex('login_info').where('email', email);
            exist = exist[0];
            if (!exist) return { error: 'Email does not match any user' }
            this.redisClient.setex(`${resetKey}`, 60 * 60 * 24, email);
            this.nodemailer.sendPasswordResetMail(email, resetKey);
            return { 'success': 'Please check your mailbox for instruction to reset your password, Please note that the email may be in junk mail box' }
        } catch (err) {
            throw err
        }
    }

    async resetPassword(key, password, confirm_password) {
        try {
            if (password.length < 8 || password.legnth > 16 || ! /[a-z]|[A-z]/.test(password) || ! /[0-9]/.test(password))
                return { error: '<p>Bad Password</p>' }
            if (password !== confirm_password)
                return { error: '<p>Password not matched</p>' }
            return this.redisClient.get(key, async (err, email) => {
                if (err) throw err
                if (!email) return { error: 'Expired Password Reset Key' };
                const hash = await this.bcrypt.hashPassword(password);
                await this.knex('login_info').where('email', email).update('password', hash)
                this.redisClient.del(key)
                return { success: 'You have successfully changed your password, you may now login with your new password' };
            });
        } catch (err) {
            throw err
        }
    }

    async resendVerificationMail(email) {
        try {
            let user = await this.knex('login_info').where('email', email)
            user = user[0]
            if (!user) return { error: 'Invalid Email' };
            this.nodemailer.sendVerificationMail(email, user.verifying);
            return { success: `Email sent, please be reminded that the email may be in your junk mail box` }
        } catch (err) {
            throw err
        }
    }

    async verifyEmail(key) {
        try {
            let user = await knex('login_info').where('verifying', key);
            user = user[0];
            if (!user) return { error: 'Invalid Verification Code' }
            const newUser = {
                email: user.email,
                password: user.password,
                verifying: null
            }
            await knex('login_info').where('verifying', key).update(newUser);
            return { success: `You have successfully verified your email address, you may now login to the game` }
        } catch (err) {
            throw err
        }
    }

    verifyResetKey(key) {
        return redisClient.get(key, (err, data) => {
            if (err) throw err
            if (!data) return false
            return true
        })
    }
}