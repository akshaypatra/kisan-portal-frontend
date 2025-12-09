import api from './api';

const palmOilClusterService = {
  // Get all states under National Oilseed Mission
  getStates: () => api.get('/api/palm-oil-cluster/states'),

  // Get state details
  getStateDetail: (stateId) => api.get(`/api/palm-oil-cluster/states/${stateId}`),

  // Get dashboard statistics
  getDashboardStats: () => api.get('/api/palm-oil-cluster/stats'),

  // Get cluster recommendations for a state
  getStateClusters: (stateId) => api.get(`/api/palm-oil-cluster/states/${stateId}/clusters`),

  // Get cluster details
  getClusterDetail: (clusterId) => api.get(`/api/palm-oil-cluster/clusters/${clusterId}`),

  // Generate policy advisory using ChatGPT
  generatePolicyAdvisory: (clusterId, focusAreas = null) =>
    api.post(`/api/palm-oil-cluster/clusters/${clusterId}/generate-advisory`, {
      cluster_id: clusterId,
      focus_areas: focusAreas
    }),

  // Get existing advisories for a cluster
  getClusterAdvisories: (clusterId) => api.get(`/api/palm-oil-cluster/clusters/${clusterId}/advisories`),
};

export default palmOilClusterService;
