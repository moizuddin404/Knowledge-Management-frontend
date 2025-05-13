import React, { useEffect, useState } from 'react';
import knowledgeCardApi from "../services/KnowledgeCardService";
import axios from 'axios';
import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, CircularProgress, Alert,
  Container, Divider, Chip, Avatar, useTheme, IconButton, Tooltip
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend
} from 'recharts';
import dayjs from 'dayjs';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import LabelIcon from '@mui/icons-material/Label';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from "../components/Navbar";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const theme = useTheme();

  // First fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userId = await knowledgeCardApi.getUserId(token);
          setUserId(userId);
        } catch (error) {
          console.error("Error fetching user ID:", error);
          setError("Failed to fetch user ID");
          setLoading(false);
        }
      } else {
        setError("No token found");
        setLoading(false);
      }
    };
    fetchUserId();
  }, []);

  // Then fetch dashboard data when userId is available
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${backendUrl}/knowledge-card/dashboard`, {
          params: { user_id: userId }
        });
        setData(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]); // dependency on userId

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" variant="filled" sx={{ fontSize: 16 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  if (!data) return null;

  const { total_cards, archived, favourites, bookmarks, global_bookmarks, shared, private: privateCount, tags, recent_cards } = data;

  const pieData = [
    { name: 'Shared', value: shared },
    { name: 'Private', value: privateCount },
  ];
  
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main];
  const tagData = Object.entries(tags || {}).map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Show top 8 tags

  // Get random color for tag chips
  const getTagColor = (tag) => {
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#e91e63', 
      '#9c27b0', '#3f51b5', '#f44336', '#009688'
    ];
    
    // Generate a consistent index based on the tag string
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderCardIcon = (index) => {
    const icons = [
      <BookmarkIcon />,
      <FavoriteIcon color="error" />,
      <ArchiveIcon color="action" />,
      <LibraryBooksIcon color="primary" />
    ];
    return icons[index];
  };

  const statsData = [
    { label: 'Total Cards', value: total_cards, icon: <LibraryBooksIcon color="primary" fontSize="large" /> },
    { label: 'Archived', value: archived, icon: <ArchiveIcon color="action" fontSize="large" /> },
    { label: 'Favourites', value: favourites, icon: <FavoriteIcon color="error" fontSize="large" /> },
    { label: 'Bookmarked', value: bookmarks, icon: <BookmarkIcon color="primary" fontSize="large" /> },
  ];

  return (
    <>
    <Navbar />
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            width: 56, 
            height: 56,
            mr: 2
          }}
        >
          <LibraryBooksIcon fontSize="large" />
        </Avatar>
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          color="text.primary"
        >
          Dashboard
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Summary Stats */}
      <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
      {/* KPI Cards */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={3} flex={1}>
        {statsData.map(({ label, value, icon }) => (
          <Card 
            key={label}
            elevation={3}
            sx={{ 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box p={1.5} borderRadius="50%" bgcolor="action.hover" mr={2}>
                  {icon}
                </Box>
                <Typography variant="h6" color="text.secondary" fontWeight="medium">
                  {label}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pie Chart */}
      <Card elevation={3} sx={{ width: 400, minWidth: 300, flexShrink: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Box p={1} borderRadius="50%" bgcolor="action.hover" mr={2}>
              <Box display="flex" alignItems="center">
                <VisibilityIcon color="primary" />
                <LockIcon color="secondary" sx={{ ml: 1 }} />
              </Box>
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Shared vs Private Cards
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={5}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card elevation={3} sx={{ width: 400, minWidth: 300, flexShrink: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Box p={1} borderRadius="50%" bgcolor="action.hover" mr={2}>
              <LabelIcon color="primary" />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Popular Tags
            </Typography>
          </Box>
          {tagData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tagData}>
                <XAxis dataKey="tag" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={250}>
              <Typography>No tag data</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>


      {/* Recent Activity */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3 
            }}
          >
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: theme.palette.action.hover,
                mr: 2
              }}
            >
              <AccessTimeIcon color="primary" />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Recent Cards
            </Typography>
          </Box>

          <Paper sx={{ overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent_cards.map((card) => (
                  <TableRow 
                    key={card.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>{card.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {card.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {card.tags.map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small"
                            sx={{ 
                              bgcolor: getTagColor(tag),
                              color: '#fff',
                              fontWeight: 'medium'
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {dayjs(card.created_at).format('DD MMM YYYY')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
      
      <Box sx={{ textAlign: 'center', mt: 4, color: theme.palette.text.secondary }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Knowledge Cards Dashboard
        </Typography>
      </Box>
    </Container>
    </>
  );
};

export default Dashboard;