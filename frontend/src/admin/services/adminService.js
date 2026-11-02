/**
 * Admin Service — all admin API calls
 */
import apiClient, { triggerDownload } from '../../services/apiClient.js';

export const adminService = {
  getDashboard: ({ year, dept, section, faculty_id, page = 1 } = {}) => {
    const params = new URLSearchParams();
    if (year)       params.set('year', year);
    if (dept)       params.set('dept', dept);
    if (section)    params.set('section', section);
    if (faculty_id) params.set('faculty_id', faculty_id);
    params.set('page', String(page));
    return apiClient.get(`/admin/dashboard?${params.toString()}`);
  },

  uploadStudents: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post('/admin/upload/students', fd);
  },

  uploadFaculty: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post('/admin/upload/faculty', fd);
  },

  downloadTemplate: async (kind) => {
    const { blob, filename } = await apiClient.download(`/admin/templates/${kind}`);
    triggerDownload(blob, filename || `template_${kind}.xlsx`);
  },
};

export default adminService;

