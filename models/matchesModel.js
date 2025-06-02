const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    hostDetail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teams: [
      {
        teamId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teams",
          required: true,
        },
        teamName: {
          type: String,
          required: true,
        },
      },
    ],
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
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
        default: null,
      },

      teamName: { type: String },
      elected: { type: String, enum: ["batFirst", "bowlFirst"] },
    },

    // Each over is an array of 6 balls
    aTeamInning: [
      {
        overNumber: {
          // Over number should be a single object, not an array
          bowlerName: { type: String },
          bowlerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
          },
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
            batsmanId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Players",
              // default: null,
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
                   "Yet to bat",
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "lbw",
              ],
              
            },
            dismissedVia: {
              type: String,
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
          bowlerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
          },
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
            batsmanId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Players",
              default: null,
            },
            bowlerName: {
              type: String,
            },
            bowlerId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Players",
              default: null,
            },
            runs: {
              type: Number,
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
                   "Yet to bat",
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "lbw",
              ],
            },
            dismissedVia: {
              type: String,
            },
          },
        ],
      },
    ],

    aTeamPlayers: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Players",
        },
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
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Players",
        },
        playerName: {
          type: String,
          default: "",
        },
        isOut: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Player-specific stats for batting
    aTeambattingStats: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
      },
      teamName: {
        type: String,
      },
      teamCode: {
        type: String,
        enum: ["FirstBatted", "SecondBatted"],
        default: "FirstBatted",
      },

      aTeambattingStats: [
        {
          playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
            default: 0,
          },
          playerName: {
            type: String,
            default: "",
          },
          isStrike: {
            type: Boolean,
            default: false,
          },
          isNonstrike: {
            type: Boolean,
            default: false,
          },
          runs: {
            type: Number,
            default: 0,
          },
          ballsFaced: {
            type: Number,
            default: 0,
          },
          fours: { type: Number, default: 0 },
          sixes: { type: Number, default: 0 },
          singles: { type: Number, default: 0 },
          doubles: { type: Number, default: 0 },
          triples: { type: Number, default: 0 },
          isOut: { type: Boolean, default: false },
          methodOfDismissal: {
            type: String,
            enum: [
              "Yet to bat",
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "lbw",
            ],
            default: "Yet to bat",
          },
          dismissedVia: {
            type: String,
          },
        },
      ],
    },

    bTeambattingStats: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
      },
      teamName: {
        type: String,
      },
      teamCode: {
        type: String,
        enum: ["FirstBatted", "SecondBatted"],
        default: "SecondBatted",
      },
      bTeamplayerStats: [
        {
          playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
            default: 0,
          },
          playerName: {
            type: String,
            default: "",
          },
          isStrike: {
            type: Boolean,
            default: false,
          },
          isNonstrike: {
            type: Boolean,
            default: false,
          },
          runs: {
            type: Number,
            default: 0,
          },
          ballsFaced: {
            type: Number,
            default: 0,
          },
          // dismissalType
          fours: { type: Number, default: 0 },
          sixes: { type: Number, default: 0 },
          singles: { type: Number, default: 0 },
          doubles: { type: Number, default: 0 },
          triples: { type: Number, default: 0 },
          isOut: { type: Boolean, default: false },
          methodOfDismissal: {
            type: String,
            enum: [
              "Yet to bat",
              "Caught",
              "Sub Caught",
              "Caught Behind",
              "Bowled",
              "Retired Hurt",
              "Run Out",
              "Stump Out",
              "Not Out",
              "lbw",
            ],
            default: "Yet to bat",
          },
          dismissedVia: {
            type: String,
          },
        },
      ],
    },

    // Bowler-specific stats
    aTeamBowlerStats: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
      },
      teamName: {
        type: String,
      },
      teamCode: {
        type: String,
        enum: ["FirstBowled", "SecondBowled"],
        default: "FirstBowled",
      },

      aTeamBowlingStats: [
        {
          playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
          },
          playerName: { type: String },
          oversBowled: { type: Number },
          runsConceded: { type: Number, default: 0 },
          wickets: {
            wicketCount: { type: Number, default: 0 },
            wikcetName: [
              {
                batterId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Players",
                },
                batterName: { Type: String },
              },
            ],
          },
          noBalls: { type: Number, default: 0 },
          wides: { type: Number, default: 0 },
          maidens: { type: Number, default: 0 },
          economyRate: { type: Number, default: 0 },
        },
      ],
    },

    bTeamBowlerStats: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
      },
      teamName: {
        type: String,
      },
      teamCode: {
        type: String,
        enum: ["FirstBowled", "SecondBowled"],
        default: "FirstBowled",
      },

      bTeamBowlingStats: [
        {
          playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Players",
          },
          playerName: { type: String },
          oversBowled: { type: Number },
          runsConceded: { type: Number, default: 0 },
          wickets: {
            wicketCount: { type: Number, default: 0 },
            wikcetName: [
              {
                batterId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Players",
                },
                batterName: { Type: String },
              },
            ],
          },
          noBalls: { type: Number, default: 0 },
          wides: { type: Number, default: 0 },
          maidens: { type: Number, default: 0 },
          economyRate: { type: Number, default: 0 },
        },
      ],
    },

    // Extras and other match details
    aTeamExtras: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
        default: null,
      },
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },

    bTeamExtras: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
        default: null,
      },
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
      default: null,
    },

    MOM: {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Players",
      },
      playerName: {
        type: String,
      },
    },

    // Reference to Tournament/Series
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },

    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Matches", matchSchema);
