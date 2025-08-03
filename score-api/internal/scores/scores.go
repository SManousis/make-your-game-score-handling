package scores

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"sync"
)

type Score struct {
	Name   string `json:"name"`
	Score  int    `json:"score"`
	TimeMs int64  `json:"time_ms"`
}

type ScoreResponse struct {
	Rank  int    `json:"rank"`
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

type PaginatedScores struct {
	Scores      []ScoreResponse `json:"scores"`
	CurrentPage int             `json:"currentPage"`
	TotalPages  int             `json:"totalPages"`
}

type PlayerStats struct {
	Rank       int     `json:"rank"`
	Percentile float64 `json:"percentile"`
}

const scoreFilePath = "scores.json"

const PageSize = 5

var fileMutex = &sync.RWMutex{}

// saves a new score and returns the player's calculated stats
func SaveScore(newScore Score) (*PlayerStats, error) {
	fileMutex.Lock()
	defer fileMutex.Unlock()

	allScores, err := readScores()
	if err != nil {
		return nil, err
	}

	allScores = append(allScores, newScore)

	//sort to find player's position
	sort.Slice(allScores, func(i, j int) bool {
		return allScores[i].Score > allScores[j].Score
	})

	//find rank and calculate percentile
	rank := -1
	for i, s := range allScores {
		if s.Name == newScore.Name && s.Score == newScore.Score && s.TimeMs == newScore.TimeMs {
			rank = i + 1
			break
		}
	}
	if rank == -1 {
		rank = len(allScores)
	} // Fallback

	percentile := (float64(rank) / float64(len(allScores))) * 100

	updatedData, err := json.MarshalIndent(allScores, "", " ")
	if err != nil {
		return nil, err
	}

	err = os.WriteFile(scoreFilePath, updatedData, 0644)
	if err != nil {
		return nil, err
	}

	return &PlayerStats{Rank: rank, Percentile: percentile}, nil
}

func RetrieveScores(page int) (*PaginatedScores, error) {

	fileMutex.RLock()
	defer fileMutex.RUnlock()

	allScores, err := readScores()
	if err != nil {
		return nil, err
	}

	//sort in descending order
	sort.Slice(allScores, func(i, j int) bool {
		return allScores[i].Score > allScores[j].Score
	})

	//paginate
	startIndex := (page - 1) * PageSize
	//if startIndex exceeds length, return empty slice
	if startIndex >= len(allScores) {
		return &PaginatedScores{Scores: []ScoreResponse{}, CurrentPage: page, TotalPages: 0}, nil
	}
	//make sure endIndex is not out of bounds
	endIndex := min(
		startIndex+PageSize, len(allScores))

	paginatedScores := allScores[startIndex:endIndex]

	responseScores := make([]ScoreResponse, 0, len(paginatedScores))
	for i, s := range paginatedScores {
		responseScores = append(responseScores, ScoreResponse{
			Rank:  startIndex + i + 1,
			Name:  s.Name,
			Score: s.Score,
			Time:  formatTime(s.TimeMs),
		})
	}

	totalPages := (len(allScores) + PageSize - 1) / PageSize

	return &PaginatedScores{
		Scores:      responseScores,
		CurrentPage: page,
		TotalPages:  totalPages,
	}, nil
}

func readScores() ([]Score, error) {

	var allScores []Score
	fileData, err := os.ReadFile(scoreFilePath)
	if err != nil && !os.IsNotExist(err) {
		return nil, err
	}

	if len(fileData) > 0 {
		err = json.Unmarshal(fileData, &allScores)
		if err != nil {
			return nil, err
		}
	}
	return allScores, nil
}

func formatTime(ms int64) string {
	if ms < 0 {
		return "00:00"
	}
	totalSeconds := ms / 1000
	minutes := totalSeconds / 60
	seconds := totalSeconds % 60
	return fmt.Sprintf("%02d:%02d", minutes, seconds)
}
