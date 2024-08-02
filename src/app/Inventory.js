import { Box, Typography, Button, Stack, TextField, Modal } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc,
  } from 'firebase/firestore'
  
  // Custom hook for Firestore initialization
  function useFirestore() {
    const [firestore, setFirestore] = useState(null)
  
    useEffect(() => {
      const initializeFirestore = async () => {
        const { firestore } = await import('@/firebase')
        setFirestore(firestore)
      }
      initializeFirestore()
    }, [])
  
    return firestore
  }
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: '90%', sm: 400},
    bgcolor: 'background.theme',
    border: '2px solid #000',
    BoxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    borderRadius: '16px',
  }

export default function Inventory({length, triggerUpdate}) {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  
  const firestore = useFirestore()


  const isMobile = useMediaQuery('(max-width: 1170px)');

  
  useEffect(() => {
    if (firestore) {
      updateInventory()
    }
  }, [firestore])

  const updateInventory = async () => {
    if (!firestore) return
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      // This call to setInventory will trigger a re-render of the component
    } catch (error) {
      console.error("Error updating inventory:", error)
      // Optionally, set an error state or show a user-friendly message
      // setError("Unable to fetch inventory. Please check your connection.")
    }
  }

  const addItem = async (item) => {
    if (!firestore) return
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const updateItem = async (oldName, newName, quantity) => {
    if (!firestore) return
    if (oldName !== newName) {
      // Remove the old item
      await deleteDoc(doc(collection(firestore, 'inventory'), oldName))
    }
    else{ 
      const docRef = doc(collection(firestore, 'inventory'), newName)
      await setDoc(docRef, { quantity })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    if (!firestore) return
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleUpdateOpen = (item) => {
    setSelectedItem(item)
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setUpdateOpen(true)
  }
  const handleUpdateClose = () => {
    setUpdateOpen(false)
    setSelectedItem(null)
    setItemName('')
    setItemQuantity(0)
  }
  useEffect(() => {
    updateInventory();
  }, [triggerUpdate, updateInventory])
  

return (
    <Box
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        width={'100%'}
        zIndex={1000}
        minHeight={length > 0 ? '500px' : '100px'}
        >
        {/* Add Item Modal */}
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{color: 'text.primary'}}>
            Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Button
                variant="outlined"
                onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
                }}
                sx={{ borderRadius: '12px' }}
            >
                Add
            </Button>
            </Stack>
        </Box>
        </Modal>

        {/* Update Item Modal */}
        <Modal
        open={updateOpen}
        onClose={handleUpdateClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{color: 'text.primary'}}>
            Update Item
            </Typography>
            <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
                id="outlined-number"
                label="Quantity"
                type="number"
                InputLabelProps={{
                shrink: true,
                }}
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Button
                variant="outlined"
                onClick={() => {
                updateItem(selectedItem.name, itemName, itemQuantity)
                handleUpdateClose()
                }}
                sx={{ borderRadius: '12px' }}
            >
                Update
            </Button>
            </Stack>
        </Box>
        </Modal>

        <Box border={'1px'} padding={2} width={'100%'} maxWidth={'800px'}>
        <Box
            width="100%"
            height="100px"
            bgcolor='background.theme'
            borderRadius={'16px 16px 0 0'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={5}
            paddingY={2}
        >
            <Typography variant={isMobile ? 'h6' : 'h4'} color={'text.primary'} textAlign={'center'}>
            Inventory
            </Typography>
            <Button variant="contained" onClick={handleOpen} sx={{ borderRadius: '12px' }}>
            <AddIcon sx={{fontSize: isMobile ? '20px' : '30px'}}/>
            </Button>
        </Box>
        <Stack width="100%" height={{xs: '200px', sm: '300px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {inventory.map((item) => (
            <Box
                key={item.name}
                width="100%"
                minHeight="150px"
                display={'flex'}
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'background.theme'}
                paddingX={5}
                paddingY={2}
                sx={{':hover':{backgroundColor:'background.hover'}, borderRadius: '0 0 5px 5px', border: '2px solid white'}}
            >
                <Typography variant={'h3'} color={'text.primary'} textAlign={'center'} fontSize={18}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </Typography>
                <Typography variant={'h3'} color={'text.primary'} textAlign={'center'} fontSize={18}>
                Quantity: {item.quantity}
                </Typography>
                <Box sx={{display: 'flex', gap: 2}}>
                <Button variant='contained' onClick={() => handleUpdateOpen(item)} sx={{ borderRadius: '12px' }}>
                    <EditIcon sx={{fontSize: isMobile ? '20px' : '30px'}}/>
                </Button>
                <Button variant="contained" onClick={() => removeItem(item.name)} sx={{ borderRadius: '12px' }}>
                    <DeleteIcon sx={{fontSize: isMobile ? '20px' : '30px'}}/>
                </Button>
                </Box>
            </Box>
            ))}
        </Stack>
        </Box>
    </Box>
    );
}

export { useFirestore }