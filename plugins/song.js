const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

module.exports = {
    com: '/song',
    dec: 'Download a YouTube video as MP3',
    use: '/song <YouTube link>',
    
    // Function to execute when /song command is triggered
    async execute(api, message) {
        const chatId = message.chat.id;
        const url = message.args;

        if (!ytdl.validateURL(url)) {
            await api.sendMessage({
                chat_id: chatId,
                text: "Invalid YouTube link. Please provide a valid link."
            });
            return;
        }

        try {
            const videoId = ytdl.getURLVideoID(url);
            const info = await ytdl.getInfo(videoId);
            const videoTitle = info.videoDetails.title;
            const mp3FilePath = path.resolve(__dirname, `${videoId}.mp3`);

            // Send thumbnail with download confirmation
            await api.sendPhoto({
                chat_id: chatId,
                photo: info.videoDetails.thumbnails.pop().url,
                caption: `🎵 ${videoTitle}\nProcessing your download...`
            });

            // Download video audio and convert to MP3
            const stream = ytdl(url, { quality: 'highestaudio' });
            ffmpeg(stream)
                .audioBitrate(128)
                .save(mp3FilePath)
                .on('end', async () => {
                    // Send MP3 file to user
                    await api.sendAudio({
                        chat_id: chatId,
                        audio: fs.createReadStream(mp3FilePath),
                        title: videoTitle
                    });
                    fs.unlinkSync(mp3FilePath); // Delete file after sending
                })
                .on('error', async (error) => {
                    console.error("Error during conversion:", error);
                    await api.sendMessage({
                        chat_id: chatId,
                        text: "An error occurred while processing your download."
                    });
                });
        } catch (error) {
            console.error("Error processing request:", error);
            await api.sendMessage({
                chat_id: chatId,
                text: "Error: Couldn't process the YouTube link."
            });
        }
    }
};
