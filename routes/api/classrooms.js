const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Daycare = require("../../models/Daycare");

// @route   PUT api/daycares/classrooms/:id
// @desc    Add a classroom to daycare
// @access  Private
router.put(
  "/classrooms/:id",
  [
    auth,
    [
      check("name", "Have to have a name for classroom ")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const newClass = {
      user: req.user.id,
      daycare: req.params.id,
      name,
      description
    };

    try {
      const daycare = await Daycare.findById(req.params.id);
      if (daycare === null) {
        return res.status(404).json({ msg: "Daycare not found" });
      }

      daycare.classrooms.unshift(newClass);
      await daycare.save();

      daycare.classrooms = daycare.classrooms.sort(function(a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      return res.status(200).json(daycare.classrooms);
    } catch (err) {
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Daycare not found by id" });
      }

      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET /api/daycares/classrooms/:id
// @desc    Get all classrooms for daycare
// @access  Private
router.get("/classrooms/:id", auth, async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.id);

    if (!daycare) return res.status(404).json({ msg: "Daycare not found" });

    if (!daycare.classrooms || daycare.classrooms.length === 0)
      return res.status(404).json({ msg: "no classrooms for daycare" });

    daycare.classrooms = daycare.classrooms.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return res.status(200).json(daycare.classrooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/daycares/classrooms/:daycare_id/:class_id
// @desc    Get classroom by id
// @access  Private
router.get("/classrooms/:daycare_id/:class_id", auth, async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.daycare_id);

    if (!daycare) return res.status(404).json({ msg: "Daycare not found" });

    if (!daycare.classrooms || daycare.classrooms.length === 0)
      return res.status(404).json({ msg: "no classrooms for daycare" });

    const classroom = daycare.classrooms.find(
      x => x.id === req.params.class_id
    );

    if (!classroom)
      return res.status(404).json({ msg: "Classroom not found by id" });

    return res.status(200).json(classroom);
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Daycare or Classroom not found" });
    }

    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/daycares/classrooms/:daycare_id/:class_id
// @desc    Delete classroom from daycare
// @access  Private
router.delete("/classrooms/:daycare_id/:class_id", auth, async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.daycare_id);

    if (!daycare) {
      return res.status(404).json({ msg: "Daycare not found" });
    }

    if (daycare.classrooms.length === 0) {
      return res
        .status(404)
        .json({ msg: "Daycare does not have any classrooms" });
    }

    const classroom = daycare.classrooms.find(
      x => x.id === req.params.class_id
    );

    if (!classroom) {
      return res.status(404).json({ msg: "No classroom found by this id" });
    }
    // Get remove index
    const removeIndex = daycare.classrooms
      .map(item => item.id)
      .indexOf(req.params.class_id);

    await daycare.classrooms.splice(removeIndex, 1);

    await daycare.save();

    res.json(daycare.classrooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/daycares/classrooms/students/:daycare_id/class_id
// @desc    Add a student to classroom
// @access  Private
router.put(
  "/classrooms/students/:daycare_id",
  [
    auth,
    [
      check("firstname", "Have to have a first name for student")
        .not()
        .isEmpty(),
      check("lastname", "Have to have a last name for student")
        .not()
        .isEmpty(),
      check("classroomname", "You must choose a classroom")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      firstname,
      lastname,
      parentname1,
      parentname2,
      classroomname,
      dixontuition,
      dixonoveragecharge,
      parentfee,
      subsidypayment
    } = req.body;

    try {
      let daycare = await Daycare.findById(req.params.daycare_id);

      if (!daycare) {
        return res.status(404).json({ msg: "Daycare not found" });
      }

      const classrooms = daycare.classrooms;

      let classroom = classrooms.find(x => x.name === classroomname);

      let duplicate = classroom.students.find(
        x =>
          x.firstname === firstname &&
          x.lastname === lastname &&
          x.classroomname === classroomname
      );
      if (duplicate) {
        let dublicateerror = [{ msg: "Student already exists" }];
        return res.status(400).json({ errors: dublicateerror });
      }

      const castCurrency = currency => {
        currency = currency.replace(",", "").replace("$", "");
        currency = parseInt(currency);
        return currency;
      };

      dixontuition = castCurrency(dixontuition);
      dixonoveragecharge = castCurrency(dixonoveragecharge);
      parentfee = castCurrency(parentfee);
      subsidypayment = castCurrency(subsidypayment);

      let newStudent = {
        user: req.user.id,
        daycare: req.params.daycare_id,
        classroom: classroom._id,
        firstname,
        lastname,
        parentname1,
        parentname2,
        classroomname,
        dixontuition,
        dixonoveragecharge,
        parentfee,
        subsidypayment,
        total: 0,
        difference: 0
      };

      newStudent.total = dixonoveragecharge + parentfee + subsidypayment;
      newStudent.difference = dixontuition - newStudent.total;
      classroom.students.push(newStudent);

      const updatedDaycare = await daycare.save();

      return res.status(200).json(updatedDaycare.classrooms);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET /api/daycares/classrooms/:id/students/
// @desc    Get all students for classroom
// @access  Private
router.get(
  "/classrooms/students/:daycare_id/:class_id",
  auth,
  async (req, res) => {
    try {
      const daycare = await Daycare.findById(req.params.daycare_id);

      if (!daycare) return res.status(404).json({ msg: "Daycare not found" });

      if (!daycare.classrooms || daycare.classrooms.length === 0)
        return res.status(404).json({ msg: "no classrooms for daycare" });

      if (
        !daycare.classrooms.students ||
        daycare.classrooms.students.length === 0
      )
        return res.status(404).json({ msg: "no students for daycare" });

      return res.status(200).json(daycare.classrooms);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET /api/daycares/:id/students/
// @desc    Get all students for daycare
// @access  Private
router.get("/:id/students", auth, async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.id);

    if (!daycare) return res.status(404).json({ msg: "Daycare not found" });

    if (!daycare.classrooms || daycare.classrooms.length === 0)
      return res.status(404).json({ msg: "no classrooms for daycare" });

    let studentcount = 0;
    daycare.classrooms.forEach(classroom => {
      classroom.students.forEach(student => {
        studentcount++;
      });
    });
    if (studentcount === 0)
      return res.status(404).json({ msg: "no students for daycare" });

    let students = [];
    daycare.classrooms.forEach(classroom => {
      classroom.students.forEach(student => {
        students.push(student);
      });
    });

    const compare = (a, b) => {
      if (a.firstname < b.firstname) {
        return -1;
      }
      if (a.firstname > b.firstname) {
        return 1;
      }
      return 0;
    };

    students.sort(compare);

    return res.status(200).json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/daycares/classrooms/students/:daycare_id/:class_id/:student_id
// @desc    Delete student from classroom
// @access  Private
router.delete(
  "/classrooms/students/:daycare_id/:class_id/:stud_id",
  auth,
  async (req, res) => {
    try {
      const daycare = await Daycare.findById(req.params.daycare_id);

      if (!daycare) {
        return res.status(404).json({ msg: "Daycare not found" });
      }

      if (daycare.classrooms.length === 0) {
        return res
          .status(404)
          .json({ msg: "Daycare does not have any classrooms" });
      }

      const classroom = daycare.classrooms.find(
        x => x.id === req.params.class_id
      );

      if (!classroom) {
        return res.status(404).json({ msg: "No classroom found by this id" });
      }

      // Get classroom index
      const classIndex = daycare.classrooms
        .map(item => item.id)
        .indexOf(req.params.class_id);

      const student = classroom.students.find(x => x.id === req.params.stud_id);

      if (!student) {
        return res.status(404).json({ msg: "No student found by this id" });
      }
      // Get remove index
      const removeIndex = classroom.students
        .map(item => item.id)
        .indexOf(req.params.stud_id);

      await daycare.classrooms[classIndex].students.splice(removeIndex, 1);

      await daycare.save();

      res.json(daycare.classrooms);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
