/**
 * Faculty Service — all faculty API calls
 */
import apiClient, { triggerDownload } from '../../services/apiClient.js';

export const facultyService = {
  getCourses: () => apiClient.get('/faculty/courses'),

  getCourseFilters: (courseId) =>
    apiClient.get(`/faculty/courses/${courseId}/filters`),

  getCourseDashboard: (courseId, { dept, year, section } = {}) => {
    const params = new URLSearchParams();
    if (dept)    params.set('dept', dept);
    if (year)    params.set('year', year);
    if (section) params.set('section', section);
    const qs = params.toString();
    return apiClient.get(`/faculty/courses/${courseId}/dashboard${qs ? '?' + qs : ''}`);
  },

  downloadReport: async (courseId, { dept, year, section } = {}) => {
    const params = new URLSearchParams();
    if (dept)    params.set('dept', dept);
    if (year)    params.set('year', year);
    if (section) params.set('section', section);
    const qs = params.toString();
    const { blob, filename } = await apiClient.download(
      `/faculty/courses/${courseId}/report${qs ? '?' + qs : ''}`
    );
    triggerDownload(blob, filename);
  },
};

export default facultyService;

