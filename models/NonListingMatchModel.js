const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    hostDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamAName: {
      //   teamId: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Teams",
      //     required: true,
      //   },
      //   teamName: {
      type: String,
      required: true,
      //   },
    },
    teamBName: {
      //   teamId: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Teams",
      //     required: true,
      //   },
      // //   teamName: {
      type: String,
      required: true,
      //   },
    },
    firstInningStarted: {
      type: Boolean,
      default: false,
    },
    secondInningStarted: {
      type: Boolean,
      default: false,
    },
    firstInningStartedOfSuperOver: {
      type: Boolean,
      default: false,
    },
    secondInningStartedOfSuperOver: {
      type: Boolean,
      default: false,
    },

    timing: { type: Date, default: null },

    overs: {
      type: Number,
      required: true,
    },
    playersAside: {
      type: Number,
      default: 11,
    },

    tossWinner: {
      //   teamId: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Teams",
      //     default: null,
      //   },

      teamName: { type: String },
      elected: { type: String, enum: ["batFirst", "bowlFirst"] },
    },

    // Each over is an array of 6 balls
    aTeamInning: [
      {
        overNumber: {
          // Over number should be a single object, not an array
          bowlerName: { type: String },
          //   bowlerId: {
          //     type: mongoose.Schema.Types.ObjectId,
          //     ref: "Players",
          //   },
          overNumber: { type: Number },
        },
        overCompleted: {
          type: String,
          enum: ["pending", "ongoing", "completed"],
          default: "pending",
        },
        balls: [
          {
            ballNumber: {
              type: Number,
            },
            batsmanName: {
              type: String,
            },
            // batsmanId: {
            //   type: mongoose.Schema.Types.ObjectId,
            //   ref: "Players",
            // default: null,
            // },
            runs: {
              type: Number,
            },
            dot: {
              type: Boolean,
            },
            single: {
              type: Boolean,
            },
            double: {
              type: Boolean,
            },
            triple: {
              type: Boolean,
            },
            four: {
              type: Boolean,
            },
            six: {
              type: Boolean,
            },
            extras: {
              type: Boolean,
              default: false,
              enum: ["wide", "no ball", "bye"],
            },
            caption: { type: String },
            isWicket: {
              type: Boolean,
              default: false,
            },
            dismissalType: {
              type: String,
              enum: [
                "Caught",
                "Sub Caught",
                "Caught behind",
                "yet to bat",
                "Bowled",
                "retired hurt",
                "Run out",
                "stump out",
                "Not out",
              ],
              default: "yet to bat",
            },
            dismissedVia: {
              type: String,
              default: null,
            },
          },
        ],
      },
    ],
    bTeamInning: [
      {
        overNumber: {
          // Over number should be a single object, not an array
          bowlerName: { type: String },
          //   bowlerId: {
          //     type: mongoose.Schema.Types.ObjectId,
          //     ref: "Players",
          //   },
          overNumber: { type: Number },
        },
        overCompleted: {
          type: String,
          enum: ["pending", "ongoing", "completed"],
          default: "pending",
        },
        balls: [
          {
            ballNumber: {
              type: Number,
            },
            batsmanName: {
              type: String,
            },
            // batsmanId: {
            //   type: mongoose.Schema.Types.ObjectId,
            //   ref: "Players",
            // default: null,
            // },
            runs: {
              type: Number,
            },
            dot: {
              type: Boolean,
            },
            single: {
              type: Boolean,
            },
            double: {
              type: Boolean,
            },
            triple: {
              type: Boolean,
            },
            four: {
              type: Boolean,
            },
            six: {
              type: Boolean,
            },
            extras: {
              type: Boolean,
              default: false,
              enum: ["wide", "no ball", "bye"],
            },
            caption: { type: String },
            isWicket: {
              type: Boolean,
              default: false,
            },
            dismissalType: {
              type: String,
              enum: [
                "Caught",
                "Sub Caught",
                "Caught behind",
                "yet to bat",
                "Bowled",
                "retired hurt",
                "Run out",
                "stump out",
                "Not out",
              ],
              default: "yet to bat",
            },
            dismissedVia: {
              type: String,
              default: null,
            },
          },
        ],
      },
    ],

    aTeamPlayers: [
      {
        playerName: {
          type: String,
          default: "",
        },

        isOut: {
          type: Boolean,
          default: false,
        },

        isTwelfthMan: {
          type: Boolean,
          default: false,
        },
      },
    ],
    bTeamPlayers: [
      {
        playerName: {
          type: String,
          default: "",
        },
        isOut: {
          type: Boolean,
          default: false,
        },
        isTwelfthMan: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isSuperOver: {
      type: Boolean,
      default: false,
    },

    aTeamSuperOverStat: {
      bowlerName: { type: String },
      runs: { type: Number, default: 0 },

      batters: [
        {
          batsmanName: { type: String, required: true },
          runs: { type: Number, default: 0 },
          ballsFaced: { type: Number, default: 0 },
          isOut: {
            type: Boolean,
            default: false,
          },
        },
      ],
      overComplete: { type: Boolean, default: false },
      balls: [
        {
          ballNumber: {
            type: Number,
          },
          batsmanName: {
            type: String,
          },

          runs: {
            type: Number,
          },
          dot: {
            type: Boolean,
          },
          single: {
            type: Boolean,
          },
          double: {
            type: Boolean,
          },
          triple: {
            type: Boolean,
          },
          four: {
            type: Boolean,
          },
          six: {
            type: Boolean,
          },
          extras: {
            type: Boolean,
            default: false,
            enum: ["wide", "no ball", "bye"],
          },
          caption: { type: String },
          isWicket: {
            type: Boolean,
            default: false,
          },
          dismissalType: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught behind",
              "yet to bat",
              "Bowled",
              "retired hurt",
              "Run out",
              "stump out",
              "Not out",
            ],
            default: "yet to bat",
          },
          dismissedVia: {
            type: String,
            default: null,
          },
        },
      ],
    },
    bTeamSuperOverStat: {
      bowlerName: { type: String },
      batters: [
        {
          batsmanName: { type: String, required: true },
          isOut: { type: Boolean, default: false },
          runs: { type: Number, default: 0 },
          ballsFaced: { type: Number, default: 0 },
        },
      ],
      runs: { type: Number, default: 0 },
      overComplete: { type: Boolean, default: false },
      balls: [
        {
          ballNumber: {
            type: Number,
          },
          batsmanName: {
            type: String,
          },

          runs: {
            type: Number,
          },
          dot: {
            type: Boolean,
          },
          single: {
            type: Boolean,
          },
          double: {
            type: Boolean,
          },
          triple: {
            type: Boolean,
          },
          four: {
            type: Boolean,
          },
          six: {
            type: Boolean,
          },
          extras: {
            type: Boolean,
            default: false,
          },
          caption: { type: String },
          isWicket: {
            type: Boolean,
            default: false,
          },
          dismissalType: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught behind",
              "yet to bat",
              "Bowled",
              "retired hurt",
              "Run out",
              "stump out",
              "Not out",
            ],
            default: "yet to bat",
          },
          dismissedVia: {
            type: String,
            default: null,
          },
        },
      ],
    },

    // Player-specific stats for batting
    aTeamBatterStats: {
      teamName: {
        type: String,
      },
      totalRuns: {
        type: Number,
      },
      inningComplete: {
        type: Boolean,
      },
      aTeambattingStats: [
        {
          playerName: {
            type: String,
            required: true,
          },

          runs: {
            type: Number,
            default: 0,
          },
          ballsFaced: {
            type: Number,
            default: 0,
          },
          dot: { type: Number, default: 0 },
          fours: { type: Number, default: 0 },
          sixes: { type: Number, default: 0 },
          singles: { type: Number, default: 0 },
          doubles: { type: Number, default: 0 },
          triples: { type: Number, default: 0 },
          isOut: { type: Boolean, default: false },
          methodOfDismissal: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught behind",
              "yet to bat",
              "Bowled",
              "retired hurt",
              "Run out",
              "stump out",
              "Not out",
            ],
            default: "yet to bat",
          },
          dismissedVia: {
            type: String,
            default: null,
          },
        },
      ],
    },
    // Player-specific stats for batting
    bTeambatterStats: {
      teamName: {
        type: String,
      },
      inningComplete: {
        type: Boolean,
      },
      totalRuns: {
        type: Number,
      },
      bTeambattingStats: [
        {
          playerName: {
            type: String,
            required: true,
          },

          runs: {
            type: Number,
            default: 0,
          },
          ballsFaced: {
            type: Number,
            default: 0,
          },
          dot: { type: Number, default: 0 },

          fours: { type: Number, default: 0 },
          sixes: { type: Number, default: 0 },
          singles: { type: Number, default: 0 },
          doubles: { type: Number, default: 0 },
          triples: { type: Number, default: 0 },
          isOut: { type: Boolean, default: false },
          methodOfDismissal: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught behind",
              "yet to bat",
              "Bowled",
              "retired hurt",
              "Run out",
              "stump out",
              "Not out",
            ],
            default: "yet to bat",
          },
          dismissedVia: {
            type: String,
            default: null,
          },
        },
      ],
    },

    // Bowler-specific stats
    aTeamBowlerStats: {
      teamName: {
        type: String,
      },

      aTeamBowlingStats: [
        {
          playerName: { type: String, required: true },
          oversBowled: { type: Number, default: 0 },
          runsConceded: { type: Number, default: 0 },
          wickets: [
            {
              batterName: { type: String },
            },
          ],
          noBalls: { type: Number, default: 0 },
          wides: { type: Number, default: 0 },
          maidens: { type: Number, default: 0 },
          economyRate: { type: Number, default: 0 },
        },
      ],
    },
    bTeamBowlerStats: {
      teamName: {
        type: String,
      },

      bTeamBowlingStats: [
        {
          playerName: { type: String, required: true },
          oversBowled: { type: Number, default: 0 },
          runsConceded: { type: Number, default: 0 },
          wickets: [
            {
              batterName: { type: String },
            },
          ],
          noBalls: { type: Number, default: 0 },
          wides: { type: Number, default: 0 },
          maidens: { type: Number, default: 0 },
          economyRate: { type: Number, default: 0 },
        },
      ],
    },

    // Extras and other match details
    aTeamExtras: {
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },

    bTeamExtras: {
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },

    // Match status and winner
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },

    winner: {
      type: String,
      default: null,
    },

    MOM: {
      playerName: {
        type: String,
      },
    },

    // Reference to Tournament/Series
  },
  { timestamps: true }
);

module.exports = mongoose.model("UnlistedMatches", matchSchema);
