import AVFoundation
import Foundation

if CommandLine.arguments.count != 4 {
    fputs("usage: compress_m4a.swift input.m4a output.m4a bitrate_bps\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
guard let bitrate = Int(CommandLine.arguments[3]) else {
    fputs("invalid bitrate\n", stderr)
    exit(2)
}

do {
    try? FileManager.default.removeItem(at: outputURL)

    let input = try AVAudioFile(forReading: inputURL)
    let format = input.processingFormat
    let channels = Int(format.channelCount)
    let sampleRate = format.sampleRate
    let settings: [String: Any] = [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVSampleRateKey: sampleRate,
        AVNumberOfChannelsKey: channels,
        AVEncoderBitRateKey: bitrate
    ]

    let output = try AVAudioFile(forWriting: outputURL, settings: settings)
    let frameCapacity: AVAudioFrameCount = 16_384
    guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCapacity) else {
        fputs("could not allocate audio buffer\n", stderr)
        exit(1)
    }

    while input.framePosition < input.length {
        try input.read(into: buffer, frameCount: min(frameCapacity, AVAudioFrameCount(input.length - input.framePosition)))
        if buffer.frameLength == 0 {
            break
        }
        try output.write(from: buffer)
    }
} catch {
    fputs("transcode failed: \(error.localizedDescription)\n", stderr)
    exit(1)
}
