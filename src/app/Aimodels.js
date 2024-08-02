import { Box, Typography, Button, Stack, Tooltip, Menu, MenuItem, Modal } from '@mui/material';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useMediaQuery } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {Camera} from "react-camera-pro";
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc,
  } from 'firebase/firestore'
import { useFirestore } from './Inventory'

// Initialize the Gemini API
//console.log('API KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export default function AIModels({setNewRecipe, refreshInventory}) {
    const isMobile = useMediaQuery('(max-width: 1170px)');
    const [image, setImage] = useState(null);
    const [result, setResult] = useState('');
    const firestore = useFirestore();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Pro');
    const [open, setOpen] = useState(false)
    const handleOpenCamera = () => setOpen(true)
    const handleCloseCamera = () => setOpen(false)
    const camera = useRef(null);
    

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const updateInventoryFromAI = async (item, quantity) => {
        if (!firestore) return
        const docRef = doc(collection(firestore, 'inventory'), item)
        await setDoc(docRef, { quantity: quantity }, { merge: true })
    }

    const googlemodelmap = {
        'Gemini 1.5 Pro (Latest)': 'gemini-1.5-pro-latest',
        'Gemini 1.5 Pro': 'gemini-1.5-pro',
        'Gemini 1.5 Flash': 'gemini-1.5-flash',
    }

    const writeRecipe = useCallback(async () => {
        try {
            if (!firestore) return;
            
            const ingredients = {};
            const inventoryRef = collection(firestore, 'inventory');
            const querySnapshot = await getDocs(query(inventoryRef));
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.quantity > 0) {
                    ingredients[doc.id] = data.quantity;
                }
            });
            console.log(ingredients);

            // Check if the selected model is in the googlemodelmap
            if (!googlemodelmap[selectedModel]) {
                console.error(`Model "${selectedModel}" not found in googlemodelmap`);
                setNewRecipe(JSON.stringify({ error: "Selected model not available for recipe generation." }));
                return;
            }

            const model = genAI.getGenerativeModel({ model: googlemodelmap[selectedModel] });
            console.log("Selected model:", googlemodelmap[selectedModel]);
            const result = await model.generateContent([
                'Write a recipe for a tasty meal using these ingredients: ' + JSON.stringify(ingredients) + '. Format the recipe as json object with the following keys: "name", "ingredients", "instructions", "nutrients", "notes" and return only the JSON object. Here\'s an example of the format I want:\n\n' +
                '{\n' +
                '  "name": "Delicious Pasta Dish",\n' +
                '  "ingredients": ["200g pasta", "100g cheese", "50g butter", "2 cloves garlic", "Salt and pepper to taste"],\n' +
                '  "instructions": "1. Cook pasta according to package instructions.\\n2. In a pan, melt butter and sauté minced garlic.\\n3. Add cooked pasta to the pan and toss with cheese.\\n4. Season with salt and pepper.\\n5. Serve hot.",\n' +
                '  "nutrients": ["Protein", "Carbohydrates", "Fat", "Calories"],\n' +
                '  "notes": "You can add vegetables like spinach or cherry tomatoes for extra flavor and nutrition."\n' +
                '}\n\n' +
                'Please ensure the recipe uses the ingredients I provided and follows this JSON structure.'
            ]);
            const response = result.response;
            console.log(response);
            const resultText = response.text();
            try {
                // Remove markdown code block syntax if present
                const cleanedText = resultText.replace(/^```json\n|\n```$/g, '').trim();
                const jsonResult = JSON.parse(cleanedText);
                console.log(jsonResult);
                setNewRecipe(jsonResult);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                setNewRecipe(JSON.stringify({ error: "Failed to parse recipe JSON. Please try again." }));
            }
        } catch (error) {
            console.error('Error generating recipe:', error);
            setNewRecipe(JSON.stringify({ error: "An error occurred while generating the recipe. Please try again." }));
        }
    }, [firestore, genAI, selectedModel, setNewRecipe, googlemodelmap]);

    const processImage = useCallback(async () => {
        if (!image) {
            console.error('No image selected');
            return;
        }

        try {
            const model = genAI.getGenerativeModel({ model: googlemodelmap[selectedModel] });
            const result = await model.generateContent([
                'State what the subject of the image and then count how many are in the image return as a json object, only return what is in the curly braces; Follow this format: `{"apple":10}`, The subject should be songular not plural.',
                { inlineData: { data: image.split(',')[1], mimeType: "image/jpeg" } }
            ]);
            const response = await result.response;
            const resultText = response.text();
            setResult(resultText);

            // Parse the result and update inventory
            try {
                const parsedResult = JSON.parse(resultText);
                const [item, quantity] = Object.entries(parsedResult)[0];
                await updateInventoryFromAI(item, quantity)
                refreshInventory();
            } catch (parseError) {
                console.error('Error parsing result:', parseError);
            }
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }, [image, genAI, updateInventoryFromAI]);

    const handleModelChange = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTakePhoto = useCallback(() => {
        const photo = camera.current.takePhoto();
        setImage(photo);
        handleCloseCamera();
        processImage();
    }, [camera, setImage, handleCloseCamera, processImage]);

    useEffect(() => {
        let isMounted = true;

        const runProcessImage = async () => {
            if (image) {
                await processImage();
            }
        };

        runProcessImage();

        return () => {
            isMounted = false;
        };
    }, [image, processImage]);


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {xs: '90vw', sm: '50vw'},
        height: {xs: '90vh', sm: '50vh'},
        bgcolor: 'background.theme',
        border: '2px solid #000',
        BoxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderRadius: '16px',
      }

    const photobuttonstyle = {
        position: 'absolute',
        top: '80%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '10px',
        padding: '6px 10px',
        fontSize: '0.8rem',
    }

    return (

        <Box border={'1px'} width={'100%'} maxWidth={'700px'}  borderRadius={'14px 14px 0 0'} zIndex={1000}>
            <Box
                width="100%"
                height="100px"
                bgcolor='background.theme'
                borderRadius={'14px 14px 0 0'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                paddingX={8}
                paddingY={3}
            >
                <Typography variant={isMobile ? 'h6' : 'h4'} color={'text.primary'} textAlign={'center'}>
                    AI Models
                </Typography>
                {/* Camera */}

                    <Modal
                            open={open}
                            onClose={handleCloseCamera}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{color: 'text.primary'}}>
                                Take a photo of your food
                                </Typography>
                        <Camera ref={camera} />
                        <Button
                            onClick={handleTakePhoto}
                            sx={photobuttonstyle}
                            variant="contained"
                        >
                            Take Photo
                        </Button>
                        </Box>
                </Modal>
                {/* End Camera */}
                <Box>
                    <Tooltip title="Change AI model" enterDelay={1000} enterNextDelay={1000}>
                        <Button variant="contained" onClick={handleModelChange} sx={{ borderRadius: '10px', mr: 1, padding: '6px 10px' }}>
                            <ChangeCircleIcon fontSize="small"/>
                        </Button>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        
                    >
                        <MenuItem color='background.theme' onClick={() => handleModelSelect('Gemini 1.5 Pro (Latest)')}>Gemini 1.5 Pro (Latest)</MenuItem>
                        <MenuItem color='background.theme' onClick={() => handleModelSelect('Gemini 1.5 Pro')}>Gemini 1.5 Pro</MenuItem>
                        <MenuItem color='background.theme' onClick={() => handleModelSelect('Gemini 1.5 Flash')}>Gemini 1.5 Flash</MenuItem>
                    </Menu>
                    <Tooltip title="Open camera" enterDelay={1000} enterNextDelay={1000}>
                        <Button variant="contained" onClick={handleOpenCamera} sx={{ borderRadius: '10px', padding: '6px 10px' }}>
                            <CameraAltIcon fontSize="small"/>
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
            <Stack width="100%" height={{xs: '200px', sm: '300px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                <Box
                    width="100%"
                    minHeight="150px"
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    bgcolor={'background.theme'}
                    paddingX={8}
                    paddingY={2}
                    sx={{':hover':{backgroundColor:'background.hover'}, borderRadius: '4px', border: '1px solid white'}}
                >
                    <Typography variant={'h3'} color={'text.primary'} textAlign={'center'} fontSize={16} mb={1.5}>
                        Current Model: {selectedModel}
                    </Typography>
                    <Typography variant={'body1'} color={'text.secondary'} textAlign={'center'} fontSize={12} mb={1.5}>
                        {image ? `Image selected. Ready to process.` : 'Select an image to process'}
                        {result ? ` Result: ${result}` : ''}
                    </Typography>
                    <Box sx={{display: 'flex', gap: 1.5}}>
                        <Tooltip title="Select image to process" enterDelay={1000} enterNextDelay={1000}>
                            <Button variant='contained' component="label" sx={{ borderRadius: '10px', padding: '6px 10px', fontSize: '0.8rem' }}>
                                Select Image
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Process selected image" enterDelay={1000} enterNextDelay={1000}>
                            <span>
                                <Button variant='contained' onClick={processImage} sx={{ borderRadius: '10px', padding: '6px 10px', fontSize: '0.8rem' }} disabled={!image}>
                                    Process Image
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>
                <Box
                    width="100%"
                    minHeight="150px"
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    bgcolor={'background.theme'}
                    paddingX={8}
                    paddingY={2}
                    sx={{':hover':{backgroundColor:'background.hover'}, borderRadius: '4px', border: '1px solid white'}}
                >
                    <Typography variant={'h3'} color={'text.primary'} textAlign={'center'} fontSize={16} mb={1.5}>
                        Generate Recipe With {selectedModel}
                    </Typography>
                    <Typography variant={'body1'} color={'text.secondary'} textAlign={'center'} fontSize={12} mb={1.5}>
                        Writing your recipe with the AI model...
                    </Typography>
                    <Box sx={{display: 'flex', gap: 1.5}}>
                        <Tooltip title="Generate recipe using AI model" enterDelay={1000} enterNextDelay={1000}>
                            <Button variant='contained' onClick={writeRecipe} sx={{ borderRadius: '10px', padding: '6px 10px', fontSize: '0.8rem' }}>Create Recipe</Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Stack>
        </Box>

    );
}