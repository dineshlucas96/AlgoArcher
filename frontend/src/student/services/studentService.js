/**
 * Student Service — all student API calls
 */
import apiClient from '../../services/apiClient.js';

export const studentService = {
  getCourses: () => apiClient.get('/student/courses'),
  getDashboard: () => apiClient.get('/student/dashboard'),
  getHeatmap: () => apiClient.get('/student/heatmap'),

  getCourseProblems: (courseId) =>
    apiClient.get(`/courses/${courseId}/problems`),

  getLeaderboard: (courseId) =>
    apiClient.get(`/courses/${courseId}/leaderboard`),

  getProblem: (problemId, courseId) =>
    apiClient.get(`/problems/${problemId}?course_id=${courseId}`),

  runCode: (problemId, sourceCode, courseId) =>
    apiClient.post(`/problems/${problemId}/run`, {
      source_code: sourceCode,
      course_id: Number(courseId),
    }),

  submitCode: (problemId, sourceCode, courseId) =>
    apiClient.post(`/problems/${problemId}/submit`, {
      source_code: sourceCode,
      course_id: Number(courseId),
    }),
};

export default studentService;

