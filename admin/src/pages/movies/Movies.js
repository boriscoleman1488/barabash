import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Movies() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управління фільмами
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Тут буде список фільмів та можливості їх редагування
      </Typography>
    </Box>
  );
}