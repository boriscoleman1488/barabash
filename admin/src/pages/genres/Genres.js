import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Genres() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управління жанрами
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Тут буде список жанрів та можливості їх редагування
      </Typography>
    </Box>
  );
}