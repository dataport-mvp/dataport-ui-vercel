// pages/employee/education.js
import React from "react";

/**
 * EDUCATION FORM SCHEMA
 * (UI + Data Contract only — no execution)
 */
export const EDUCATION_FORM_SCHEMA = {
  page: "education.js",
  follows: "Master Form & Layout Contract",

  sections: {
    "Class X": {
      rows: [
        {
          row: 1,
          fields: [
            "School Name",
            "Board Name",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          row: 2,
          fields: [
            "Class X Certificate (Upload)",
            "Start Date",
            "End Date",
            "School Address"
          ]
        }
      ],
      additional_fields: [
        "Year of Passing (YYYY)",
        {
          Result: {
            type: ["Percentage", "Grade"],
            value: true
          }
        },
        "Medium of Instruction (optional)"
      ]
    },

    "Intermediate": {
      rows: [
        {
          row: 1,
          fields: [
            "College Name",
            "Board Name",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          row: 2,
          fields: [
            "Intermediate Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      additional_fields: [
        "Year of Passing (YYYY)",
        {
          Result: {
            type: ["Percentage", "Grade"],
            value: true
          }
        },
        "Medium of Instruction (optional)"
      ]
    },

    "UG": {
      rows: [
        {
          row: 1,
          fields: [
            "College Name",
            "Course / Degree",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          row: 2,
          fields: [
            "Degree / Provisional Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      additional_fields: [
        "University Name",
        "Year of Passing (YYYY)",
        {
          Result: {
            type: ["Percentage", "CGPA", "Grade"],
            value: true
          }
        },
        {
          Backlogs: {
            hasBacklogs: "Yes / No",
            numberOfBacklogs: "optional_if_yes"
          }
        }
      ]
    },

    "PG": {
      optional: true,
      rows: [
        {
          row: 1,
          fields: [
            "College Name",
            "Course / Degree",
            "Hall Ticket / Roll Number"
          ]
        },
        {
          row: 2,
          fields: [
            "Degree / Provisional Certificate (Upload)",
            "Start Date",
            "End Date",
            "College Address",
            "Mode of Education (Full-time / Part-time / Distance)"
          ]
        }
      ],
      additional_fields: [
        "University Name",
        "Year of Passing (YYYY)",
        {
          Result: {
            type: ["Percentage", "CGPA", "Grade"],
            value: true
          }
        },
        {
          Backlogs: {
            hasBacklogs: "Yes / No",
            numberOfBacklogs: "optional_if_yes"
          }
        }
      ]
    }
  },

  validation_expectations: {
    hall_ticket: "alphanumeric_allowed",
    dates: "from <= to",
    year_of_passing: "must_match_end_date_year",
    uploads: "pdf / jpg / jpeg / png",
    mode_of_education: "mandatory_for_inter_ug_pg"
  }
};

/**
 * PAGE COMPONENT
 * (Minimal JSX so build passes cleanly)
 */
export default function EducationPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "2rem"
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Education Details
        </h1>

        <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
          This page follows the Master Form & Layout Contract.
        </p>

        <pre
          style={{
            background: "#f8fafc",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            overflowX: "auto"
          }}
        >
          {JSON.stringify(EDUCATION_FORM_SCHEMA, null, 2)}
        </pre>
      </div>
    </main>
  );
}

