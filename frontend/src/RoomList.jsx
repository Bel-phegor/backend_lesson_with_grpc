import { useState, useEffect } from 'react';
import axios from 'axios';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import {useNavigate} from 'react-router-dom'

export const RoomList = ({ selectedRoomId, setSelectedRoomId,allReload,setAllReload }) => {
  const rawUserData = sessionStorage.getItem("userData");
  const navigate = useNavigate();
  if(rawUserData === null){
    navigate("/signin")
  }
  const user = rawUserData ? JSON.parse(rawUserData):null;
  const [rooms, setRooms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [infoSelectedRoom, setInfoSelectedRoom] = useState(null);

  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const handleInfoClick = async (roomId) => {
    try {
      const url = `http://localhost:1323/rooms/${roomId}`;
      const response = await axios(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
      });
      let room = response.data;
      const datetime = new Date(room?.createdAt);
      const year = datetime.getFullYear();
      const month = datetime.getMonth() + 1;
      const day = datetime.getDate();

      room.createdAt= `${year}年${month}月${day}日`;
      setInfoSelectedRoom(room)
      setIsOpen(true);
    } catch (error) {
      console.error('Error occurred while fetching room details:', error);
      if(error?.request?.status === 401){
        navigate("/")
      }
    }
  };


  useEffect(() => {
    const fetchRoomsData = async () => {
      const url = 'http://localhost:1323/rooms';
      const response = await axios(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
      });
      return response.data
    };

    const fetchRooms = async () => {
      try {
        const response = await fetchRoomsData();
        setRooms(response.Rooms);
      } catch (error) {
        console.error('Error occurred while fetching room list:', error);
        if(error?.request?.status === 401){
          navigate("/")
        }
      }
    };
    if(allReload){
      setAllReload(false);
    }
    fetchRooms();
  }, [selectedRoomId, allReload, setAllReload, navigate, user.token]);

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {rooms &&
        rooms.map((r, index) => (
          <div key={r.id}>
            <Box display="flex" alignItems="center" p={1}>
              <Box flexGrow={1}>
                <ListItemButton onClick={() => handleRoomClick(r.id)}>
                  <ListItemText primary={r.name} style={{ textAlign: 'center' }} />
                </ListItemButton>
              </Box>
              <IconButton onClick={() => handleInfoClick(r.id)}>
                <InfoIcon />
              </IconButton>
            </Box>
            <Divider />
          </div>
        ))}
        <Modal open={isOpen} onClose={handleCloseModal} aria-labelledby="modal-title">
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              p: 4,
              outline: 'none',
              borderRadius: 8,
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.15)',
              maxWidth: 400,
              width: '100%',
            }}
          >
            <Typography variant="h6" id="modal-title" sx={{ marginBottom: 2 }}>
              ルーム詳細
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" component="div" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                Name:
              </Typography>
              <Typography variant="body1" component="div" sx={{ marginBottom: '1rem' }}>
                {infoSelectedRoom?.name}
              </Typography>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" component="div" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                Description:
              </Typography>
              <Typography variant="body1" component="div" sx={{ marginBottom: '1rem' }}>
                {infoSelectedRoom?.description}
              </Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" component="div" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                CreatedAt:
              </Typography>
              <Typography variant="body1" component="div" sx={{ marginBottom: '1rem' }}>
                {infoSelectedRoom?.createdAt}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};