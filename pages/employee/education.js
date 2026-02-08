{
  "page": "education.js",
  "follows": "Master Form & Layout Contract",

  "sections": {
    "Class X": {
      "rows": [
        {
          "row": 1,
          "fields": [
            "School Name",
            "Board Name",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          "row": 2,
          "fields": [
            "Class X Certificate (Upload)",
            "Start Date",
            "End Date",
            "School Address"
          ]
        }
      ],
      "additional_fields": [
        "Year of Passing (YYYY)",
        {
          "Result": {
            "type": ["Percentage", "Grade"],
            "value": true
          }
        },
        "Medium of Instruction (optional)"
      ]
    },

    "Intermediate": {
      "rows": [
        {
          "row": 1,
          "fields": [
            "College Name",
            "Board Name",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          "row": 2,
          "fields": [
            "Intermediate Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      "additional_fields": [
        "Year of Passing (YYYY)",
        {
          "Result": {
            "type": ["Percentage", "Grade"],
            "value": true
          }
        },
        "Medium of Instruction (optional)"
      ]
    },

    "UG": {
      "rows": [
        {
          "row": 1,
          "fields": [
            "College Name",
            "Course / Degree",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          "row": 2,
          "fields": [
            "Degree / Provisional Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      "additional_fields": [
        "University Name",
        "Year of Passing (YYYY)",
        {
          "Result": {
            "type": ["Percentage", "CGPA", "Grade"],
            "value": true
          }
        },
        {
          "Backlogs": {
            "hasBacklogs": "Yes / No",
            "numberOfBacklogs": "optional_if_yes"
          }
        }
      ]
    },

    "PG": {
      "optional": true,
      "rows": [
        {
          "row": 1,
          "fields": [
            "College Name",
            "Course / Degree",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          "row": 2,
          "fields": [
            "Degree / Provisional Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      "additional_fields": [
        "University Name",
        "Year of Passing (YYYY)",
        {
          "Result": {
            "type": ["Percentage", "CGPA", "Grade"],
            "value": true
          }
        },
        {
          "Backlogs": {
            "hasBacklogs": "Yes / No",
            "numberOfBacklogs": "optional_if_yes"
          }
        }
      ]
    }
  },

  "validation_expectations": {
    "hall_ticket": "alphanumeric_allowed",
    "dates": "from <= to",
    "year_of_passing": "must_match_end_date_year",
    "uploads": "pdf / jpg / jpeg / png",
    "mode_of_education": "mandatory_for_inter_ug_pg"
  },

  "ui_rules": {
    "section_order_fixed": true,
    "no_layout_variation": true,
    "file_upload_position": "immediately_below_related_section",
    "same_spacing_as_personal_page": true
  }
}

