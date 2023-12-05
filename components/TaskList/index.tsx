import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { calculateRemainingDays } from "../../utils/date";
import ITask from "../../types/task";
import { useEffect, useState } from "react";
import axios from "axios";
import TaskModal from "../TaskModal";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import styles from "../../styles/markdown.module.css";

export default function TaskList({
  tasks,
  setTasks,
}: {
  tasks?: ITask[];
  setTasks: React.Dispatch<React.SetStateAction<ITask[] | undefined>>;
}) {
  const [ID, setID] = useState<null | string>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<ITask | null>(null);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    setID(window.location.href.split("/")[4]);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, item: ITask) => {
    setAnchorEl(e.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDeleteTask = () => {
    axios
      .delete(`/api/tasks/delete/${selectedItem?.id}`)
      .then((res) => {
        setError("");
        const { deletedTask } = res.data;
        setTasks((tasks) => tasks?.filter((task) => task.id !== deletedTask.id));
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" component="h2">
          Recent Tasks ({tasks?.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button component={Link} href={`/`} startIcon={<ArrowBackIcon />} variant="contained" color="primary">
            Back to projects
          </Button>
          <Button
            component={Link}
            href={`/projects/${ID}/tasks/create`}
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
          >
            New task
          </Button>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ marginY: 2 }}>
          {error}
        </Alert>
      )}
      {tasks?.map(
        (task) =>
          task.status === "IN_PROGRESS" &&
          calculateRemainingDays(task.deadline) < 0 && (
            <Alert
              severity="warning"
              variant="outlined"
              sx={{ marginY: 2 }}
              key={task.id}
              action={
                <Button
                  color="warning"
                  onClick={() => {
                    setIsOpen(true);
                    setSelectedItem(task);
                  }}
                >
                  Edit
                </Button>
              }
            >
              Important: Task &quot;{task.name}&quot; is overdue. You can change the deadline.
            </Alert>
          )
      )}
      {tasks && tasks.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "row", flexWrap: 'wrap', gap: "16px" }}>
          {tasks.map((task) => (
            <Card
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setSelectedItem(task);
              }}
              sx={{
                padding: 1,
                borderRadius: 2,
                boxShadow: "rgba(0, 0, 0, 0.18) 0px 0px 0px 1px",
                "&:hover": {
                  cursor: "pointer",
                  transform: "scale3d(1.004, 1.004, 1)",
                },
                flexBasis: 'calc(33% - 7px)',
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" component="h3">
                  {task.name}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(e, task);
                  }}
                  aria-label="Options"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component={Box}
                  sx={{
                    marginTop: 1,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-wrap",
                    fontSize: "12px",
                  }}
                >
                  <ReactMarkdown className={styles.reactMarkdown}>{task.description}</ReactMarkdown>
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: task.description ? 1 : 0,
                }}
              >
                <Typography sx={{ fontSize: 12 }} color="text.secondary">
                  <AccessTimeIcon
                    color="warning"
                    sx={{
                      fontSize: 12,
                      verticalAlign: "text-top",
                    }}
                  />{" "}
                  {task.status === "COMPLETED"
                    ? "Completed"
                    : calculateRemainingDays(task.deadline) >= 1
                    ? `Due in ${calculateRemainingDays(task.deadline)} ${
                        calculateRemainingDays(task.deadline) === 1 ? "day" : "days"
                      }`
                    : calculateRemainingDays(task.deadline) === 0
                    ? "Due is Today"
                    : "Overdue"}
                </Typography>
                <AvatarGroup sx={{ marginRight: 0.75 }}>
                  <Tooltip title={task.authorName} arrow>
                    <Avatar
                      src={task.authorAvatar}
                      alt={task.authorName}
                      sx={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  </Tooltip>
                </AvatarGroup>
              </Box>
              <Menu open={Boolean(anchorEl) && selectedItem?.id === task.id} onClose={handleClose} anchorEl={anchorEl}>
                <MenuItem
                  onClick={() => {
                    setIsOpen(true);
                    setSelectedItem(task);
                  }}
                >
                  Edit task
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    handleDeleteTask();
                  }}
                >
                  Remove task
                </MenuItem>
              </Menu>
              <TaskModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                task={task}
                user={user}
                setTasks={setTasks}
              />
            </Card>
          ))}
        </Box>
      ) : (
        <Alert severity="info" variant="outlined">
          There are no tasks.
        </Alert>
      )}
    </Box>
  );
}
