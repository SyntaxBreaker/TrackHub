import { useState } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { getCurrentDate } from "../../utils/date";
import { useRouter } from "next/router";
import axios from 'axios';
import validateField from "../../utils/validateField";
import { UserProfile } from "@auth0/nextjs-auth0/client";

export default function TaskForm({ user, method }: { user: UserProfile | undefined, method: string }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        deadline: getCurrentDate()
    });
    const [error, setError] = useState<null | string>(null);

    const router = useRouter();
    const { id } = router.query;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!validateField(formData.name)) return

        const data = {
            ...formData,
            authorId: user?.email,
            authorName: user?.nickname,
            authorAvatar: user?.picture
        }

        if (method === "POST") {
            axios.post('/api/tasks/create', {
                task: data,
                id
            })
                .then(res => {
                    setError(null)
                    window.location.href = `/projects/${id}/tasks`
                })
                .catch(err => setError(err.message))
        }
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            <Typography
                variant="h5"
                component="h2">
                Create a new task
            </Typography>
            {error && <Typography
                variant="body1"
                paragraph={true}
                sx={{ color: 'error.light' }}>
                {error}
            </Typography>}
            <TextField
                error={!validateField(formData.name) ? true : false}
                helperText={!validateField(formData.name) && "This name should have at least one character."}
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                sx={{ width: '350px' }}
                value={formData.name}
                onChange={handleChange}
            />
            <TextField
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                multiline={true}
                sx={{ width: '350px' }}
                value={formData.description}
                onChange={handleChange}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    minDate={getCurrentDate()}
                    value={formData.deadline}
                    onChange={(newValue) => setFormData(prevData => ({
                        ...prevData,
                        deadline: dayjs(newValue)
                    }))} />
            </LocalizationProvider>
            <Button
                type="submit"
                variant="contained"
                color="primary">
                Add a new task
            </Button>
        </Box>
    )
}