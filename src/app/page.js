  'use client'

  import { useMediaQuery } from '@mui/material';
  import AIModels from './Aimodels';
  import { Box, Typography, Stack, List, ListItem, ListItemText, Collapse } from '@mui/material'
  import Inventory from './Inventory';
  import { useState, useEffect, useRef, useCallback } from 'react';
  import ReactMarkdown from 'react-markdown';
  import React from 'react';
  import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
  import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
  import {Camera} from "react-camera-pro";

  export default function Home() {
    const isMobile = useMediaQuery('(max-width: 1170px)');
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [openRecipe, setOpenRecipe] = useState(null);
    const [isRecipeOpen, setIsRecipeOpen] = useState(false);
    const [triggerUpdate, setTriggerUpdate] = useState(0);



    const handleNewRecipe = (newRecipe) => {
      setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
    };

    const handleRecipeClick = (recipeName) => {
      if (selectedRecipe === recipeName) {
        setSelectedRecipe(null);
        setOpenRecipe(null);
        setIsRecipeOpen(false);
      } else {
        setSelectedRecipe(recipeName);
        setOpenRecipe(recipeName);
        setIsRecipeOpen(true);
      }
    };

    const refreshInventory = useCallback(() => {
      setTriggerUpdate(prev => prev + 1);
    }, []);

    return (
      <Box 
        sx={{
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          minHeight: '200vh',
          width: '100%',
          paddingTop: 20,
        }}
      >





        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            height: recipes.length === 0 ? '80vh' : '100%',
            bgcolor: recipes.length === 0 ? 'background.default' : 'background.default',
            
          }}
        >
          {/* Inventory component */}
          <Inventory length={recipes.length} triggerUpdate={triggerUpdate}/>
          {/* AIModels component */}
          <AIModels setNewRecipe={handleNewRecipe} refreshInventory={refreshInventory} />


            {/* Column 1  Recipes*/}
        {recipes.length > 0 ? (
          <Box border={'1px'} 
          width={'100%'} 
          maxWidth={'800px'} 
          borderRadius={'16px 16px 0 0'} 
          display={'flex'} 
          bgcolor={'background.theme'}
          height="400px"
          flexDirection={'column'}
          padding={5}
        
         
          margin={2 } // Added to center horizontally
          >
            <Box
              width="100%"
              height="20px" 
              bgcolor='background.theme'
              display={'flex'}
              borderRadius={'16px'}
              justifyContent={!isRecipeOpen ? 'center' : 'space-between'}
              alignItems={'center'}
            >
              <Typography variant={isMobile ? 'h5' : 'h4'} color={'text.primary'} textAlign={'center'}>
                Recipes
              </Typography>
            </Box>
            <Stack color={'text.primary'} width="100%" height={{xs: '300px', sm: '400px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {recipes.length > 0 && (
                <List>
                  {recipes.map((recipe, index) => (
                    <React.Fragment key={index}>
                      <ListItem onClick={() => handleRecipeClick(recipe.name)}>
                        {openRecipe === recipe.name ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
                        <ListItemText primary={recipe.name} />
                      </ListItem>
                      <Collapse in={openRecipe === recipe.name} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="body2">Instructions:</Typography>
                          <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
                        </Box>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Stack>
          </Box>
        ) : (<></>)}



        </Box>
        
      <Box
        sx={{
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          minHeight: '5vh', // Decreased from 10vh to 5vh
          width: '100%',
        }}
      >
        {/* Second Row */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: 2,
            width: '100%',
          }}
        >
        

          {/* Column 2  Ingredients*/}
    {isRecipeOpen && selectedRecipe && (
          <Box border={'1px'} 
          width={'100%'} 
          maxWidth={'800px'} 
          borderRadius={'16px 16px 0 0'} 
          display={'flex'} 
          flexDirection={'column'}
          bgcolor={'background.theme'}
          height="200px"
          >
            <Box
              width="100%"
              height="80px" // Decreased from 100px to 80px
              bgcolor='background.theme'
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              paddingX={5}
              paddingY={2}
            >
              <Typography variant={isMobile ? 'h5' : 'h4'} color={'text.primary'} textAlign={'center'}>
                Ingredients
              </Typography>
            </Box>
            <Stack color={'text.primary'} width="100%" height={{xs: '150px', sm: '250px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {recipes.find(recipe => recipe.name === selectedRecipe) && (
                <Box display={'flex'} flexDirection={'row'}>
                   {[0, 1, 2].map((columnIndex) => (
                    <Box key={columnIndex} flex={1} px={1}>
                      <List>
                        {recipes.find(recipe => recipe.name === selectedRecipe).ingredients.filter((_, index) => index % 3 === columnIndex).map((ingredient, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={ingredient} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          </Box>
)}
          {/* Column 3 Nutrients*/}
{isRecipeOpen && selectedRecipe && (
          <Box 
          border={'1px'} 
          width={'100%'} 
          maxWidth={'800px'} 
          borderRadius={'16px 16px 0 0'} 
            display={'flex'} 
            flexDirection={'column'}
            bgcolor={'background.theme'}
            height="200px"
          >
            <Box
              width="100%"
              height="80px" // Decreased from 100px to 80px
              borderRadius={'16px'}
              bgcolor='background.theme'
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              paddingX={5}
              paddingY={2}
            >
              <Typography variant={isMobile ? 'h5' : 'h4'} color={'text.primary'} textAlign={'center'}>
                Nutrients
              </Typography>
            </Box>
            <Box color={'text.primary'} width="100%" height={{xs: '150px', sm: '250px'}} overflow={'auto'} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {recipes.find(recipe => recipe.name === selectedRecipe) && (
                <Box display="flex" flexDirection="row">
                  {[0, 1, 2].map((columnIndex) => (
                    <Box key={columnIndex} flex={1} px={1}>
                      <List>
                        {recipes.find(recipe => recipe.name === selectedRecipe).nutrients
                          .filter((_, index) => index % 3 === columnIndex)
                          .map((nutrient, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={nutrient} />
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box> 
  )}
        </Box>
       

        </Box>
      </Box>
    )
  }