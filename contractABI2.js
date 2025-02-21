contractABI2  = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "createRoom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sessionId",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string[]",
				"name": "dataChannels",
				"type": "string[]"
			}
		],
		"name": "DataChannelsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "JoinedRoom",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "joinRoom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "trackName",
				"type": "string"
			}
		],
		"name": "publishTrack",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "RoomCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sessionId",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "sdp",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "sdpType",
				"type": "string"
			}
		],
		"name": "SessionRenegotiated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isModerator",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "role",
				"type": "string"
			}
		],
		"name": "setUserInfo",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "participant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "trackName",
				"type": "string"
			}
		],
		"name": "TrackPublished",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sessionId",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "remoteSession",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "trackName",
				"type": "string"
			}
		],
		"name": "TrackPulled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "participant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "trackName",
				"type": "string"
			}
		],
		"name": "TrackUnpublished",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "trackName",
				"type": "string"
			}
		],
		"name": "unpublishTrack",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isModerator",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "role",
				"type": "string"
			}
		],
		"name": "UserUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getAllRooms",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getIceServers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "urls",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "username",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "credential",
						"type": "string"
					}
				],
				"internalType": "struct Meeting.ICEServer[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			}
		],
		"name": "getRoomParticipants",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "roomId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "participant",
				"type": "address"
			}
		],
		"name": "getSessionTracks",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			}
		],
		"name": "getUserInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "userId",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isModerator",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "role",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]