import { Box, Typography, Button, Stack, TextField, Modal, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc,
    writeBatch,
} from 'firebase/firestore'

// Custom hook for Firestore initialization
function useFirestore() {
    const [firestore, setFirestore] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const initializeFirestore = async () => {
            if (!firestore) {
                const { firestore: fs } = await import('@/firebase');
                if (isMounted) setFirestore(fs);
            }
        };
        initializeFirestore();
        return () => { isMounted = false; };
    }, [firestore]);

    return firestore;
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
    const isInitialMount = useRef(true);

    const updateInventory = useCallback(async () => {
        if (!firestore) return
        try {
            const snapshot = query(collection(firestore, 'inventory'))
            const docs = await getDocs(snapshot)
            const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }))
            setInventory(inventoryList)
        } catch (error) {
            console.error("Error updating inventory:", error)
        }
    }, [firestore])

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (firestore) {
                updateInventory()
            }
        }
    }, [firestore, updateInventory, triggerUpdate])

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

    const subtractItem = async (item) => {
      if (!firestore) return
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
          const { quantity } = docSnap.data()
          await setDoc(docRef, { quantity: quantity - 1 })
      } else {
          return
      }
      await updateInventory()
  }

    const updateItem = async (oldName, newName, quantity) => {
        if (!firestore) return
        const batch = writeBatch(firestore)
        if (oldName !== newName) {
            batch.delete(doc(collection(firestore, 'inventory'), oldName))
        }
        batch.set(doc(collection(firestore, 'inventory'), newName), { quantity })
        await batch.commit()
        await updateInventory()
    }
    
    const removeItem = async (item) => {
        if (!firestore) return
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            await deleteDoc(docRef)
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
                <Box width="100%" height={{xs: '200px', sm: '300px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Table stickyHeader>
                        <TableHead >
                            <TableRow>
                                <TableCell sx={{backgroundColor: 'background.theme'}}>Item Name</TableCell>
                                <TableCell sx={{backgroundColor: 'background.theme'}} align="center">Quantity</TableCell>
                                <TableCell sx={{backgroundColor: 'background.theme'}} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {inventory.map((item) => (
                                <TableRow
                                    key={item.name}
                                    sx={{
                                        backgroundColor: 'background.theme',
                                        '&:hover': { backgroundColor: 'background.hover' },
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                                    </TableCell>
                                    <TableCell align="center">{item.quantity}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => addItem(item.name)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                <AddIcon sx={{fontSize: isMobile ? '16px' : '20px'}}/>
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => subtractItem(item.name)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                <RemoveIcon sx={{fontSize: isMobile ? '16px' : '20px'}}/>
                                            </Button>
                                            <Button
                                                variant='contained'
                                                onClick={() => handleUpdateOpen(item)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                <EditIcon sx={{fontSize: isMobile ? '16px' : '20px'}}/>
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => removeItem(item.name)}
                                                sx={{ minWidth: 'auto', p: 1 }}
                                            >
                                                <DeleteIcon sx={{fontSize: isMobile ? '16px' : '20px'}}/>
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </Box>
    );
}

export { useFirestore }