import { Button, Layout, Space, message } from "antd"
import { useEffect, useRef, useState } from "react"
import { Socket, io } from "socket.io-client"


const WebRTC: React.FC = () => {

    const socket = useRef<Socket>()

    const localVideo = useRef<HTMLVideoElement>(null)
    const remoteVideo = useRef<HTMLVideoElement>(null)

    const pc = useRef<RTCPeerConnection>()
    const stream = useRef<MediaStream>()

    /**
     * 初始化
     */
    useEffect(() => {
        const _socket: Socket = io('http://localhost:5001')
        _socket.on('offer', e => {
            console.log('offer ->', e)
            pc.current?.setRemoteDescription(new RTCSessionDescription(e))
        })
        _socket.on('answer', e => {
            console.log('answer ->', e)
            pc.current?.setRemoteDescription(new RTCSessionDescription(e))
        })
        _socket.on('candidate', e => {
            console.log('candidate ->', e)
            pc.current?.addIceCandidate(new RTCIceCandidate(e))
        })
        socket.current = _socket
        createRTCPeerConnection()

        // startSharding()
    }, [])

    /**
     * 开始共享
     * @returns 
     */
    const startSharding = async () => {
        if (!(navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
            message.warning({
                content: '当前浏览器版本不支持共享屏幕'
            })
            return
        }
        try {
            stream.current = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            localVideo.current && (localVideo.current.srcObject = stream.current)
            addLocalStreamToRTC()
        } catch (error) {
            message.error({
                content: error?.toString()
            })
        }
    }

    /**
     * 创建连接
     */
    const createRTCPeerConnection = () => {
        const _pc = new RTCPeerConnection({
            // {urls: ['stun:stun.stunprotocol.org:3478']}
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })
        _pc.onicecandidate = e => {
            if (e.candidate) {
                // console.log('candidate', JSON.stringify(e.candidate))
                socket.current?.emit('candidate', e.candidate)
            }
        }
        _pc.ontrack = e => {
            remoteVideo.current!.srcObject = e.streams[0]
        }
        pc.current = _pc
    }

    /**
     * 添加本地流到连接
     */
    const addLocalStreamToRTC = () => {
        const _stream = stream.current!
        _stream.getTracks().forEach(it => {
            pc.current?.addTrack(it, _stream)
        })
    }

    const createOffer = () => {
        pc.current?.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }).then(sdp => {
            // console.log('offer ->', JSON.stringify(sdp))
            pc.current?.setLocalDescription(sdp)
            socket.current?.emit('offer', sdp)
        })
    }

    const createAnswer = () => {
        pc.current?.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
        }).then(sdp => {
            // console.log('answer ->', JSON.stringify(sdp))
            pc.current?.setLocalDescription(sdp)
            socket.current?.emit('answer', sdp)
        })
    }

    return <Layout className="rtc-layout">

        <video ref={remoteVideo} autoPlay className="remoteScreen"></video>

        <div className="localScreen">
            <video ref={localVideo} autoPlay></video>
        </div>

        <Space className="rtc-footer">
            <Button type="text" onClick={startSharding}>共享屏幕</Button>
            <Button type="text" onClick={createOffer}>创建Offer</Button>
            <Button type="text" onClick={createAnswer}>创建Answer</Button>
        </Space>

    </Layout>

}

export default WebRTC