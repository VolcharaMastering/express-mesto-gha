/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const {
  OK_CODE, CODE_CREATED, INCORRECT_DATA, NOT_FOUND, SERVER_ERROR,
} = require('../states/states');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('email=', email, password);
  try {
    const user = await User.findOne({ email });
    res.status(OK_CODE).send(user);
  } catch (e) {
    res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере', ...e });
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(OK_CODE).send(users);
  } catch (evt) {
    res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
      return;
    }
    res.status(OK_CODE).send(user);
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(INCORRECT_DATA).send({ message: 'Невалидный id ' });
      return;
    }
    res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
  }
};
const createUser = async (req, res) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  const checkMail = User.findOne({ email });
  if (checkMail) {
    res.status(INCORRECT_DATA).send({ message: 'Такой email уже есть в базе' });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
      email, password: hashedPassword, name, about, avatar,
    }).save();
    res.status(CODE_CREATED).send(user);
  } catch (e) {
    // if (e.errors.name) {
    if (e.name === 'ValidatorError') {
      res.status(INCORRECT_DATA).send({ message: 'Запрос не прошёл валидацию. Обязательное поле "Имя" не заполнено' });
      return;
    }
    // }
    /*     if (e.errors.about) {
          if (e.errors.about.name === 'ValidatorError') {
            res.status(INCORRECT_DATA).send({ message: 'Запрос не прошёл валидацию. Обязательное поле "профессия" не заполнено' });
            return;
          }
        }
        if (e.errors.avatar) {
          if (e.errors.avatar.name === 'ValidatorError') {
            res.status(INCORRECT_DATA).send({ message: 'Запрос не прошёл валидацию. Обязательное поле "аватар" не заполнено' });
            return;
          } */
    res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
  }
  // }
};
const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
        return;
      }
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Некорректные данные' });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
    });
};
const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND).send({ message: 'Такого пользователя нет' });
        return;
      }
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Некорректные данные' });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
    });
};
const routeNotFoud = (req, res) => {
  res.status(NOT_FOUND).send({ message: 'Страница не найдена' });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
  routeNotFoud,
  login,
};
