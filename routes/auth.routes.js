const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const config = require('config');
const User = require('../models/User');
const router = Router();

router.post(
    '/register', 
    [
        check('email', 'Некорректный email.').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов.')
            .isLength({min: 6})
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации!'
                });
            }

            const {email, password} = req.body;

            const candidate = await User.findOne({email});

            if(candidate) {
                return res.status(400).json({message: 'Такой пользователь уже зарегистрирован!'});
            };

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({email, password: hashedPassword});

            await user.save();

            res.status(201).json({message: 'Пользователь создан.'});

        } catch (error) {
            res.status(500).json({message: 'Что-то пошло не так, попробуйте снова.'});
        }
    }
);

router.post(
    '/login', 
    [
        check('email', 'Введите корректный email.').normalizeEmail().isEmail(),
        check('password', 'Введите пароль.').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при входе в систему!'
                });
            };

            const {email, password} = req.body;

            const user = await User.findOne({email});

            if(!user) {
                return res.status(400).json({message: 'Данный пользователь не найден.'});
            };

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if(!isPasswordMatch) {
                return res.status(400).json({message: 'Неверный пароль, побройте снова.'});
            };

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            );

            res.status(200).json({token, userId: user.id});

        } catch (error) {
            res.status(500).json({message: 'Что-то пошло не так, попробуйте снова.'});
        }
    }
);


module.exports = router;