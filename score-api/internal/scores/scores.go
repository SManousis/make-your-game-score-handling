package scores

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"sync"
)

type Score struct {
	Name   string `json:"name"`
	Score  int    `json:"score"`
	TimeMs int64  `json:"time_ms"`
}

const scoreFilePath = "scores.json"

var fileMutex = &sync.Mutex{}

func SaveScore(newScore Score) error {
	fileMutex.Lock()
	defer fileMutex.Unlock()

	var allScores []Score
	fileData, err := ioutil.ReadFile(scoreFilePath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	if len(fileData) > 0 {
		err = json.Unmarshal(fileData, &allScores)
		if err != nil {
			return err
		}
	}

	allScores = append(allScores, newScore)
	updatedData, err := json.MarshalIndent(allScores, "", " ")
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(scoreFilePath, updatedData, 0644)
	if err != nil {
		return err
	}

	return nil
}
