import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import knowledgeCardApi from '../services/KnowledgeCardService';
import { toast } from 'react-hot-toast';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

export default function DeleteDialog({ cardData, removeCardFromUI, toggleKcMenu }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteClick = async () => {
    try {
        const response = await knowledgeCardApi.handleDelete(cardData);
              toast.success("Card Deleted");
              console.log(response);
              removeCardFromUI(cardData.card_id);
      } catch (error) {
        console.error("Error Deleting Card", error);
    }
  }

  return (
    <React.Fragment>
      <Button
      sx={{
        textTransform: "none", 
        color: "black",       
        width: "100%",
        padding: "8px 16px",
        textAlign: 'left',
        justifyContent: 'flex-start',
        '&:hover': {
          backgroundColor: "#d1fae5"
        }
      }}
       onClick={(e)=>{
        e.stopPropagation();
        handleClickOpen();
        toggleKcMenu();
    }}
       >
       <DeleteRoundedIcon fontSize='small' className='mr-2'/> Delete
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this Card?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action can not be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e)=>{e.stopPropagation();handleClose();}} className="!bg-gray-300 !text-white hover:!bg-gray-400">
            No
            </Button>
          <Button onClick={(e)=>{e.stopPropagation();handleDeleteClick();}} autoFocus className="!bg-red-500 !text-white hover:!bg-red-700">Yes
          </Button>
           
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
