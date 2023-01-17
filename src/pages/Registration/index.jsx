import React from "react";
import { Navigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { fetchRegister, selectIsAuth } from "../../redux/slices/auth";

import styles from "./Login.module.scss";

export const Registration = () => {
	const isAuth = useSelector(selectIsAuth);
	const dispatch = useDispatch();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isValid },
	} = useForm({
		defaultValues: {
			fullName: "Сейтенова Динара",
			email: "d@mail.ru",
			password: "12345",
		},
		mode: "onChange", // можно указать реагировать на все, либо вообще убрать
	});

	const onMySubmit = async (values) => {
		console.log(values);
		const data = await dispatch(fetchRegister(values));
		if (!data.payload) {
			return alert("Не удалось зарегистрироваться");
		}
		if ("token" in data.payload) {
			window.localStorage.setItem("token", data.payload.token);
		} else {
			alert("Не удалось зарегистрироваться");
		}
	};

	if (isAuth) {
		return <Navigate to="/" />;
	}
	return (
		<Paper classes={{ root: styles.root }}>
			<Typography classes={{ root: styles.title }} variant="h5">
				Создание аккаунта
			</Typography>
			<div className={styles.avatar}>
				<Avatar sx={{ width: 100, height: 100 }} />
			</div>

			<form onSubmit={handleSubmit(onMySubmit)}>
				<TextField
					className={styles.field}
					label="Полное имя"
					type="text"
					error={Boolean(errors.fullName?.message)}
					helperText={errors.fullName?.message}
					{...register("fullName", { required: "Укажите полное имя" })}
					fullWidth
				/>
				<TextField
					className={styles.field}
					label="E-Mail"
					type="email"
					error={Boolean(errors.email?.message)}
					helperText={errors.email?.message}
					{...register("email", { required: "Укажите вашу почту" })}
					fullWidth
				/>
				<TextField
					className={styles.field}
					label="Пароль"
					type="password"
					error={Boolean(errors.password?.message)}
					helperText={errors.password?.message}
					{...register("password", { required: "Укажи свой пароль" })}
					fullWidth
				/>
				<Button
					type="submit"
					disabled={!isValid}
					size="large"
					variant="contained"
					fullWidth>
					Зарегистрироваться
				</Button>
			</form>
		</Paper>
	);
};
