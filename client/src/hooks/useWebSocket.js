import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://172.24.150.148:3000/ws"; 

export function useWebsocket(teamId = null) {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [teamState, setTeamState ] = useState(null);
    const [allteams, setAllTeams] = useState([]);
    const wsRef = useRef(null);
    const reconnecTimeoutRef = useRef(null);
    
}