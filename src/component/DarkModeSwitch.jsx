import React from 'react';
import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const DarkModeSwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                content: '"🌙"', // Moon emoji for dark mode
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
            },
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#f50057',
        width: 32,
        height: 32,
        borderRadius: '50%',
        '&:before': {
            content: '"☀️"', // Sun emoji for light mode
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
        },
    },
    '& .MuiSwitch-track': {
        borderRadius: 20 / 2,
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        boxSizing: 'border-box',
    },
}));

export default DarkModeSwitch;
