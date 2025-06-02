const mongoose = require("mongoose");
const matchSchema = new mongoose.Schema(
  {
    hostDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchType: {
      type: String,
      default: null,
    },
    teamAName: {
      type: String,
      required: true,
    },
    teamBName: {
      type: String,
      required: true,
    },
    addNewBatter: {
      type: Boolean,
      default: false,
    },
    chooseNextBowler: {
      type: Boolean,
      default: false,
    },
    isSuperOver: {
      type: Boolean,
      default: false,
    },
    resultMessege: {
      type: String,
      default: null,
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
    firstInningEnded: {
      type: Boolean,
      default: false,
    },
    secondInningEnded: {
      type: Boolean,
      default: false,
    },
    firstInningEndedOfSuperOver: {
      type: Boolean,
      default: false,
    },
    secondInningEndedOfSuperOver: {
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
      teamName: { type: String },
      elected: { type: String, enum: ["Bat First", "Bowl First"] },
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
            currentTotalBalls: {
              type: Number,
              default: 0,
            },
            currentTotalRuns: {
              type: Number,
              default: 0,
            },
            currentTotalWickets: {
              type: Number,
              default: 0,
            },
            OverThrow: {
              type: Number,
              default: 0,
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
            wide: {
              type: Boolean,
              default: false,
            },
            byes: {
              type: Boolean,
              default: false,
            },
            noBall: {
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
                "Caught Behind",
                "Yet To Bat",
                "Bowled",
                "Retired Hurt",
                "Run Out",
                "Stump Out",
                "Not Out",
                "LBW",
              ],
              default: "Yet To Bat",
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
            currentTotalRuns: {
              type: Number,
              default: 0,
            },
            currentTotalBalls: {
              type: Number,
              default: 0,
            },
            currentTotalWickets: {
              type: Number,
              default: 0,
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
            wide: {
              type: Boolean,
              default: false,
            },
            byes: {
              type: Boolean,
              default: false,
            },
            noBall: {
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
                "Caught Behind",
                "Yet To Bat",
                "Bowled",
                "Retired Hurt",
                "Run Out",
                "Stump Out",
                "Not Out",
                "LBW",
              ],
              default: "Yet To Bat",
            },
            dismissedVia: {
              type: String,
              default: null,
            },
          },
        ],
      },
    ],
    aTeamFallOfWicket: [
      {
        batterName: { type: String },
        ballNumber: { type: Number },
        runs: { type: Number },
        wickets: { type: Number },
      },
    ],
    bTeamFallOfWicket: [
      {
        batterName: { type: String },

        ballNumber: { type: Number },
        runs: { type: Number },
        wickets: { type: Number },
      },
    ],

    aTeamPlayers: [
      {
        playerName: {
          type: String,
          default: "",
        },
        isOutSuperOver: {
          type: Boolean,
          default: false,
        },

        isOut: {
          type: Boolean,
          default: false,
        },
        outOnBallNumber: {
          type: Number,
          default: 0,
        },

        isTwelfthMan: {
          type: Boolean,
          default: false,
        },
        methodOfDismissal: {
          type: String,
          enum: [
            "Caught",
            "Sub Caught",
            "Caught Behind",
            "Yet To Bat",
            "Bowled",
            "Retired Hurt",
            "Run Out",
            "Stump Out",
            "Not Out",
            "LBW",
          ],
          default: "Yet To Bat",
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
        isOutSuperOver: {
          type: Boolean,
          default: false,
        },
        isTwelfthMan: {
          type: Boolean,
          default: false,
        },
        methodOfDismissal: {
          type: String,
          enum: [
            "Caught",
            "Sub Caught",
            "Caught Behind",
            "Yet To Bat",
            "Bowled",
            "Retired Hurt",
            "Run Out",
            "Stump Out",
            "Not Out",
            "LBW",
          ],
          default: "Yet To Bat",
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
      boundaries: {
        type: Number,
        default: 0,
      },
      batters: [
        {
          batsmanName: { type: String, required: true },
          runs: { type: Number, default: 0 },
          wicketTaker: {
            type: String,
          },

          ballsFaced: { type: Number, default: 0 },
          isOut: {
            type: Boolean,
            default: false,
          },

          four: {
            type: Number,
          },
          six: {
            type: Number,
          },
          dismissedVia: {
            type: String,
          },
          methodOfDismissal: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
          },
        },
      ],
      overComplete: { type: Boolean, default: false },
      balls: [
        {
          ballNumber: {
            type: Number,
          },
          currentTotalRuns: {
            type: Number,
          },
          currentTotalWickets: {
            type: Number,
          },
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
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
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
      boundaries: {
        type: Number,
        default: 0,
      },
      batters: [
        {
          batsmanName: { type: String, required: true },
          wicketTaker: {
            type: String,
          },

          isOut: { type: Boolean, default: false },
          runs: { type: Number, default: 0 },
          four: {
            type: Number,
          },
          six: {
            type: Number,
          },
          dismissedVia: {
            type: String,
          },
          ballsFaced: { type: Number, default: 0 },
          methodOfDismissal: {
            type: String,
            enum: [
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
          },
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
          currentTotalRuns: {
            type: Number,
          },
          currentTotalWickets: {
            type: Number,
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
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
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
      boundaries: {
        type: Number,
        default: 0,
      },
      ballsFaced: { type: Number, default: 0 },
      ballsYetToFace: { type: Number, default: 0 },

      totalRuns: {
        type: Number,
        default: 0,
      },
      totalWickets: {
        type: Number,
        default: 0,
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
          wicketTaker: {
            type: String,
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
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
          },
          dismissedVia: {
            type: String,
            default: null,
          },
        },
      ],
    },
    // Player-specific stats for batting
    bTeamBatterStats: {
      teamName: {
        type: String,
      },
      boundaries: {
        type: Number,
        default: 0,
      },
      inningComplete: {
        type: Boolean,
      },
      totalWickets: {
        type: Number,
        default: 0,
      },
      ballsFaced: { type: Number, default: 0 },
      ballsYetToFace: { type: Number, default: 0 },

      totalRuns: {
        type: Number,
        default: 0,
      },
      bTeambattingStats: [
        {
          playerName: {
            type: String,
            required: true,
          },
          wicketTaker: {
            type: String,
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
              "Caught Behind",
              "Yet To Bat",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "LBW",
            ],
            default: "Yet To Bat",
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
          ballsBowled: { type: Number, default: 0 },
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
          ballsBowled: { type: Number, default: 0 },

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
    aTeamExtrasOfSuperOver: {
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },

    bTeamExtrasOfSuperOver: {
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },
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
    aTeamExtrasOfSuperOver: {
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },

    bTeamExtrasOfSuperOver: {
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
    superOverResult:{
      type:String,

    },

    winner: {
      type: String,
      default: null,
    },
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },

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
