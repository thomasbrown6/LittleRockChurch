import axios from "axios";
import { setAlert } from "./alert";
import {
  GET_CLASSROOM,
  GET_CLASSROOMS,
  CLASSROOM_ERROR,
  UPDATE_CLASSROOM,
  CLEAR_CLASSROOMS,
  DELETE_CLASSROOM,
  GET_STUDENTS,
  STUDENTS_ERROR
} from "./types";

// Get classrooms by daycare
export const getClassroomsByDaycare = id => async dispatch => {
  try {
    const res = await axios.get(`/api/daycares/classrooms/${id}`);

    dispatch({
      type: GET_CLASSROOMS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Get students by daycare
export const getStudentsByDaycare = id => async dispatch => {
  try {
    const res = await axios.get(`/api/daycares/${id}/students`);

    dispatch({
      type: GET_STUDENTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: STUDENTS_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Get classroom by Id
export const getClassroomById = (daycare_id, class_id) => async dispatch => {
  try {
    const res = await axios.get(
      `/api/daycares/classrooms/${daycare_id}/${class_id}`
    );

    dispatch({
      type: GET_CLASSROOM,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Add Classroom
export const addClassroom = (formData, id) => async dispatch => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };

    const res = await axios.put(
      `/api/daycares/classrooms/${id}`,
      formData,
      config
    );

    dispatch({
      type: UPDATE_CLASSROOM,
      payload: res.data
    });
    dispatch(setAlert("Classroom Added", "success"));
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "success")));
    }

    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Add Student
export const addStudent = (formData, daycare_id) => async dispatch => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };

    //const class = await axios.get('/api');

    const res = await axios.put(
      `/api/daycares/classrooms/students/${daycare_id}`,
      formData,
      config
    );

    dispatch({
      type: UPDATE_CLASSROOM,
      payload: res.data
    });

    dispatch(setAlert("Student Added", "success"));
    //to show it was success in the front end
    return true;
  } catch (err) {
    console.log("error hit: " + err);
    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
    const errors = err.response.data.errors;

    console.log("should send alert " + err.response.msg);
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "success")));
    }
  }
};

// Delete student
export const deleteStudent = (
  daycare_id,
  class_id,
  student_id
) => async dispatch => {
  try {
    const res = await axios.delete(
      `/api/daycares/classrooms/students/${daycare_id}/${class_id}/${student_id}`
    );

    dispatch({
      type: UPDATE_CLASSROOM,
      payload: res.data
    });

    dispatch(setAlert("Student Removed", "success"));
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "success")));
    }
    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Delete student
export const getStudent = (
  daycare_id,
  class_id,
  student_id
) => async dispatch => {
  try {
    const res = await axios.get(
      `/api/daycares/classrooms/students/${daycare_id}/${class_id}/${student_id}`
    );

    dispatch({
      type: UPDATE_CLASSROOM,
      payload: res.data
    });
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, "success")));
    }
    dispatch({
      type: CLASSROOM_ERROR,
      payload: { msg: err.response, status: err.response.status }
    });
  }
};

// Delete classroom
export const deleteClassroom = (daycareId, classId) => async dispatch => {
  if (window.confirm("Are you sure you want to delete your classroom?")) {
    try {
      const res = await axios.delete(
        `/api/daycares/classrooms/${daycareId}/${classId}`
      );

      dispatch({ type: DELETE_CLASSROOM });
      dispatch({ type: GET_CLASSROOMS, payload: res.data });

      dispatch(setAlert("Your classroom has been deleted", "success"));
    } catch (err) {
      const errors = err.response.data.errors;

      if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, "success")));
      }
      dispatch({
        type: CLASSROOM_ERROR,
        payload: {
          msg: err.response,
          status: err.response.status
        }
      });
    }
  }
};
