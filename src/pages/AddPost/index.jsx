import React from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../redux/slices/auth";
import axios from "../../axios";
import { useNavigate, Navigate, useParams } from "react-router-dom";

export const AddPost = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isAuth = useSelector(selectIsAuth);
	const [isLoading, setLoading] = React.useState(false);
	const [imageUrl, setImageUrl] = React.useState();
	const [title, setTitle] = React.useState("");
	const [tags, setTags] = React.useState("");
	const [text, setText] = React.useState("");
	const isEditing = Boolean(id);

	React.useEffect(() => {
		if (id) {
			axios.get(`/posts/${id}`).then(({ data }) => {
				console.log(data);
				setImageUrl(data.imageUrl);
				setTitle(data.title);
				setTags(data.tags.join(" "));
				setText(data.text);
			});
		}
	}, []);

	const inputFileRef = React.useRef();

	const handleChangeFile = async (event) => {
		try {
			const formData = new FormData();
			const file = event.target.files[0];
			formData.append("image", file);
			const { data } = await axios.post("/upload", formData);
			setImageUrl(data.url);
		} catch (error) {
			console.warn(error);
			alert("Ошибка при загрузке файла!");
		}
	};

	const onClickRemoveImage = () => {
		setImageUrl("");
	};

	const onChange = React.useCallback((value) => {
		setText(value);
	}, []);

	const onSubmit = async () => {
		try {
			const fields = { title, tags: tags.split(" "), text, imageUrl };
			setLoading(true);
			const { data } = isEditing
				? await axios.patch(`/posts/${id}`, fields)
				: await axios.post("/posts", fields);
			const _id = isEditing ? id : data._id;
			navigate(`/posts/${_id}`);
		} catch (error) {
			console.warn(error);
			alert("Ошибка при создании статьи");
		}
	};

	const options = React.useMemo(
		() => ({
			spellChecker: false,
			maxHeight: "400px",
			autofocus: true,
			placeholder: "Введите текст...",
			status: false,
			autosave: {
				enabled: true,
				delay: 1000,
			},
		}),
		[]
	);

	if (!window.localStorage.getItem("token") && !isAuth) {
		return <Navigate to="/" />;
	}

	return (
		<Paper style={{ padding: 30 }}>
			<Button
				onClick={() => inputFileRef.current.click()}
				variant="outlined"
				size="large">
				Загрузить превью
			</Button>
			<input
				ref={inputFileRef}
				type="file"
				onChange={handleChangeFile}
				hidden
			/>
			{imageUrl && (
				<Button variant="contained" color="error" onClick={onClickRemoveImage}>
					Удалить
				</Button>
			)}
			{imageUrl && (
				<img
					className={styles.image}
					src={imageUrl ? `${process.env.REACT_APP_API_URL}${imageUrl}` : ""}
					alt="Uploaded"
				/>
			)}
			<br />
			<br />
			<TextField
				classes={{ root: styles.title }}
				variant="standard"
				placeholder="Заголовок статьи..."
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				fullWidth
			/>
			<TextField
				classes={{ root: styles.tags }}
				variant="standard"
				placeholder="Тэги"
				value={tags}
				onChange={(e) => setTags(e.target.value)}
				fullWidth
			/>
			<SimpleMDE
				className={styles.editor}
				value={text}
				onChange={onChange}
				options={options}
			/>
			<div className={styles.buttons}>
				<Button onClick={onSubmit} size="large" variant="contained">
					{isEditing ? "Сохранить" : "Опубликовать"}
				</Button>
				<a href="/">
					<Button size="large">Отмена</Button>
				</a>
			</div>
		</Paper>
	);
};
